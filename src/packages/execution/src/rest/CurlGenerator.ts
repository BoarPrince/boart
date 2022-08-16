import { URLSearchParams } from 'url';

import { JsonHelper, UrlLoader } from '@boart/core';

import { ExecutionInfo } from './ExecutionInfo';

/**
 *
 */
export class CurlGenerator {
    /**
     *
     */
    constructor(private executionInfo: ExecutionInfo) {}

    /**
     *
     */
    generate(): string {
        const curl = [];
        const method = this.executionInfo.option.method || 'get';
        const url = this.executionInfo.url.replace(UrlLoader.dockerLocal, 'localhost');

        curl.push(`curl -i -X ${method} '${url}'`);

        for (const [key, value] of Object.entries(this.executionInfo.option.headers)) {
            curl.push(`-H '${key}: ${value}'`);
        }

        if (!!this.executionInfo.option.body) {
            if (this.executionInfo.option.body.constructor.name === 'URLSearchParams') {
                for (const [key, value] of (this.executionInfo.option.body as URLSearchParams).entries()) {
                    curl.push(`--data-urlencode '${key}=${value}'`);
                }
            } else {
                const data = JsonHelper.create(this.executionInfo.option.body).simple();
                curl.push(`--data-binary '${data.replace(/\n/g, '\n\t\t').replace("'", "\\'")}'`);
            }
        }

        return curl.join(' \\\n\t');
    }
}
