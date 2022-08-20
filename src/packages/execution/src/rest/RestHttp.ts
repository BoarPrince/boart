import { DataContent, EnvLoader, JsonHelper } from '@boart/core';
import { default as Form_Data } from 'form-data';
import jwt_decode from 'jwt-decode';
import { Subject } from 'rxjs';

import { CurlGenerator } from './CurlGenerator';
import { ExecutionInfo } from './ExecutionInfo';

/**
 *
 */
const throwIfNotOk = (stmt: boolean, errorStmt: string) => {
    if (!stmt) {
        throw Error(errorStmt);
    }
};

/**
 *
 */
interface BearerToken {
    accessToken: string;
    decoded: string;
}

/**
 *
 */
export class RestHttp {
    private url: string;
    private executionInfo: ExecutionInfo;
    private messages: Subject<string>;

    /**
     *
     */
    constructor(url: string) {
        this.url = url;
        this.messages = new Subject();
    }

    /**
     *
     */
    private addHeaderInfo(
        bearer_token: string,
        headers?: Record<string, string>
    ): {
        headers: Record<string, string>;
        mode: RequestMode;
        referrerPolicy: ReferrerPolicy;
    } {
        headers = headers || {};
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (!!bearer_token) {
            headers['Authorization'] = 'Bearer ' + bearer_token;
            this.messages.next('Requested rest url (with bearer token): ' + this.url);
        } else {
            this.messages.next('Requested rest url (no bearer token): ' + this.url);
        }

        return {
            mode: 'no-cors',
            referrerPolicy: 'unsafe-url',
            headers
        };
    }

    /**
     *
     */
    private fetch(url: string, option: RequestInit): Promise<Response> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.executionInfo = JSON.parse(
            JSON.stringify({
                url: this.url,
                option: option
            })
        );

        if (option.body instanceof URLSearchParams) {
            const body = {};
            for (const entry of option.body.entries()) {
                body[entry[0]] = entry[1];
            }
            this.executionInfo.option.body = body as BodyInit;
        }

        return fetch(url, option);
    }

    /**
     *
     */
    public async bearer(
        grant_type: string,
        client_id: string,
        client_secret: string,
        scope: string,
        username: string,
        password: string
    ): Promise<BearerToken> {
        const params = new URLSearchParams();
        params.append('grant_type', grant_type);
        params.append('client_id', client_id);
        params.append('response_type', 'code id_token token');
        params.append('scope', scope || EnvLoader.instance.get('identity_default_scope'));

        if (!!client_secret) {
            params.append('client_secret', client_secret);
        }

        if (!!username) {
            params.append('username', username);
        }

        if (!!password) {
            params.append('password', password);
        }

        this.messages.next(
            `url: ${this.url}\nheader: ${JsonHelper.create(
                Array.from(params.entries()).map(([k, v]) => k + ':' + v)
            ).beautifyForHTMLOutput()}`
        );

        const response = await this.fetch(this.url, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            mode: 'no-cors',
            referrerPolicy: 'unsafe-url'
        });

        throwIfNotOk(
            response.status === 200,
            `error while request (status (${response.status}) != 200) \n\turl: ${this.url} \n\tclient_id: ${client_id}` +
                `\n\tclient_secret: ${client_secret}\n\tstatus: ${response.status}\n\tResponse: ${JSON.stringify(response)}`
        );

        const json_response = (await response.json()) as object;

        throwIfNotOk(
            !!json_response,
            `error while request (cannot extract json from response) \n\turl: ${this.url} \n\tclient_id: ${client_id} \n\tclient_secret: ${client_secret}`
        );

        const accessToken = json_response['access_token'] as string;
        return {
            accessToken,
            get decoded(): string {
                try {
                    return JSON.stringify(jwt_decode(accessToken));
                } catch (error) {
                    return '-- decoding not possible --';
                }
            }
        };
    }

    /**
     *
     */
    public async post_param(
        post_para: Record<string, string>,
        bearer_token?: string | null,
        headers?: Record<string, string> | null
    ): Promise<Response> {
        const params = new URLSearchParams();
        for (const key of Object.keys(post_para)) {
            params.append(key, post_para[key]);
        }

        const info = this.addHeaderInfo(bearer_token, headers);
        return this.fetch(this.url, {
            method: 'POST',
            body: params,
            headers: Object.assign(info.headers, {
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
            mode: info.mode,
            referrerPolicy: info.referrerPolicy
        });
    }

    /**
     *
     */
    public async form_data(
        form_data: Record<string, string | Blob>,
        bearer_token?: string | null,
        headers?: Record<string, string> | null
    ): Promise<Response> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
        const formData = new Form_Data() as any;

        for (const key of Object.keys(form_data)) {
            const value = form_data[key];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            formData.append(key, value);
        }

        const info = this.addHeaderInfo(bearer_token, headers);
        return this.fetch(this.url, {
            method: 'POST',
            // body: new Blob(encoder, { type: encoder.contentType }),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            body: formData,
            headers: Object.assign(info.headers, {}),
            mode: info.mode,
            referrerPolicy: info.referrerPolicy
        });
    }

    /**
     *
     */
    public async post(
        body: DataContent | string,
        bearer_token?: string | null,
        headers?: Record<string, string> | null
    ): Promise<Response> {
        throwIfNotOk(!!body, 'there is no body defined!');

        const info = this.addHeaderInfo(bearer_token, headers);
        return this.fetch(this.url, {
            method: 'POST',
            body: !!(body as DataContent).toJSON ? (body as DataContent).toJSON() : (body as string),
            headers: info.headers,
            mode: info.mode,
            referrerPolicy: info.referrerPolicy
        });
    }

    /**
     *
     */
    public async put(body: DataContent | string, bearer_token?: string | null, headers?: Record<string, string> | null): Promise<Response> {
        throwIfNotOk(!!body, 'there is no body defined!');

        const info = this.addHeaderInfo(bearer_token, headers);
        return this.fetch(this.url, {
            method: 'PUT',
            body: !!(body as DataContent).toJSON ? (body as DataContent).toJSON() : (body as string),
            headers: info.headers,
            mode: info.mode,
            referrerPolicy: info.referrerPolicy
        });
    }

    /**
     *
     */
    public async get(bearer_token?: string | null, headers?: Record<string, string> | null): Promise<Response> {
        const info = this.addHeaderInfo(bearer_token, headers);
        return this.fetch(this.url, {
            method: 'GET',
            headers: Object.assign(info.headers, {
                'Content-Type': 'application/json'
            }),
            mode: info.mode,
            referrerPolicy: info.referrerPolicy
        });
    }

    /**
     *
     */
    public async delete(bearer_token?: string | null, headers?: Record<string, string> | null): Promise<Response> {
        const info = this.addHeaderInfo(bearer_token, headers);
        return this.fetch(this.url, {
            method: 'DELETE',
            headers: Object.assign(info.headers, {
                'Content-Type': 'application/json'
            }),
            mode: info.mode,
            referrerPolicy: info.referrerPolicy
        });
    }

    /**
     *
     */
    public getExecutionInfo(): ExecutionInfo {
        this.executionInfo.getCurl = () => new CurlGenerator(this.executionInfo).generate();
        return this.executionInfo;
    }
}
