import jwt_decode from 'jwt-decode';

import { Diagnostic } from './Diagnostic';
import { ExecutionInfo } from './ExecutionInfo';
import { FetchOption } from './FetchOption';

/**
 *
 */
const tryParse = (content: string, failedContent: string = null): string => {
    try {
        return JSON.parse(content);
    } catch (error) {
        return failedContent;
    }
};

/**
 *
 */
export class DiagnosticGenerator {
    /**
     *
     */
    constructor(private executionInfo: ExecutionInfo) {}

    /**
     *
     */
    private getRaw(): Diagnostic {
        return {
            url: this.executionInfo.url,
            option: JSON.parse(
                JSON.stringify(this.executionInfo.option, (k, value: Map<string, string>) => {
                    try {
                        if (!!value && value.constructor && value.constructor.name === 'URLSearchParams') {
                            return Array.from<string>(value.keys())
                                .reduce<Array<string>>((result, key) => {
                                    result.push(`${key}=${value.get(key)}`);
                                    return result;
                                }, [])
                                .join('&');
                        }
                        return value;
                    } catch (error) {
                        console.log(error);
                        return value;
                    }
                })
            ) as FetchOption // deep copy
        };
    }

    /**
     *
     */
    public generate(): Diagnostic {
        const diagnistic = this.getRaw();
        const bearerToken = (diagnistic.option.headers.Authorization || '').replace('Bearer ', '');
        if (!!bearerToken) {
            diagnistic.bearerJWT = jwt_decode(bearerToken);
        }
        const body = diagnistic.option.body;
        if (!!body) {
            diagnistic.option.body = tryParse(body, body);
        }

        if (!!diagnistic.option.agent) {
            diagnistic.option.agent['_sessionCache'] = undefined;
        }
        return diagnistic;
    }
}
