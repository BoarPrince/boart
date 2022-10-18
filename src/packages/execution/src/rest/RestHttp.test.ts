import { TextContent } from '@boart/core';
import fetchMock from 'jest-fetch-mock';

import { RestHttp } from './RestHttp';

fetchMock.enableMocks();

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');
    return {
        __esModule: true,
        ...originalModule,
        EnvLoader: class {
            public static get instance() {
                return {
                    get: () => 'scope'
                };
            }
        }
    };
});

/**
 *
 */
describe('check rest http', () => {
    /**
     *
     */
    describe('null parameter', () => {
        /**
         *
         */
        beforeEach(() => {
            fetchMock.doMock('hello world');
        });

        /**
         *
         */
        it('check null parameter (get)', async () => {
            const sut = new RestHttp('http://url');
            const response = await sut.get(null, null);

            const result = await response.text();

            expect(result).toBe('hello world');
            expect(response.headers.get('content-type')).toBe('text/plain;charset=UTF-8');
        });

        /**
         *
         */
        it('check null parameter (post)', async () => {
            const sut = new RestHttp('http://url');
            try {
                await sut.post('', null, null);
            } catch (error) {
                expect(error.message).toBe('there is no body defined!');
                return;
            }

            throw Error('error must occur if no body is defined');
        });

        /**
         *
         */
        it('check null parameter (put)', async () => {
            fetchMock.doMock('xxx');
            const sut = new RestHttp('http://url');

            const response = await sut.put('', null, null);
            const result = await response.text();

            expect(result).toBe('xxx');
            expect(fetchMock.mock.calls[0]).toEqual([
                'http://url',
                { body: '', headers: { 'Content-Type': 'application/json' }, method: 'PUT', mode: 'no-cors', referrerPolicy: 'unsafe-url' }
            ]);
        });

        /**
         *
         */
        it('check null parameter (delete)', async () => {
            const sut = new RestHttp('http://url');
            const response = await sut.delete(null, null);

            const result = await response.text();

            expect(result).toBe('hello world');
            expect(response.headers.get('content-type')).toBe('text/plain;charset=UTF-8');
        });

        /**
         *
         */
        it('check null parameter (post param)', async () => {
            const sut = new RestHttp('http://url');
            const response = await sut.post_param({}, null, null);

            const result = await response.text();

            expect(result).toBe('hello world');
            expect(response.headers.get('content-type')).toBe('text/plain;charset=UTF-8');
        });

        /**
         *
         */
        it('check null parameter (bearer)', async () => {
            fetchMock.doMock(JSON.stringify({ access_token: 'xxxx' }));
            const sut = new RestHttp('http://url');
            const bearer = await sut.bearer('', '', '', '', '', '');

            expect(bearer.accessToken).toBe('xxxx');
        });
    });

    /**
     *
     */
    describe('bearer token', () => {
        /**
         *
         */
        it('check decoding bearer (failing)', async () => {
            fetchMock.doMock(JSON.stringify({ access_token: 'xxxx' }));
            const sut = new RestHttp('http://url');
            const bearer = await sut.bearer('', '', '', '', '', '');

            expect(bearer.decoded).toBe('-- decoding not possible --');
        });

        /**
         *
         */
        it('check decoding bearer (good)', async () => {
            const accessToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            fetchMock.doMock(JSON.stringify({ access_token: accessToken }));
            const sut = new RestHttp('http://url');
            const bearer = await sut.bearer('', '', '', '', '', '');

            const decoded = JSON.parse(bearer.decoded) as object;
            expect(decoded['name']).toBe('John Doe');
        });

        /**
         *
         */
        it('check get with bearer token', async () => {
            fetchMock.doMock('xxx');

            const sut = new RestHttp('http://url');
            const response = await sut.get('my-bearer', null);

            const result = await response.text();

            expect(result).toBe('xxx');
            expect(fetchMock.mock.calls[0][0]).toBe('http://url');
            expect(fetchMock.mock.calls[0][1]?.headers).toHaveProperty('Authorization');
            expect(fetchMock.mock.calls[0][1]?.headers?.['Authorization']).toBe('Bearer my-bearer');
        });

        /**
         *
         */
        it('check bearer with parameter', async () => {
            const accessToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            fetchMock.doMock(JSON.stringify({ access_token: accessToken }));

            const sut = new RestHttp('http://url');
            const response = await sut.bearer('my-password', 'my-client-id', 'my-secret', 'my-scope', 'my-username', 'my-password');

            expect(response.accessToken).toBe(accessToken);
            expect(fetchMock.mock.calls[0][0]).toBe('http://url');
            expect(fetchMock.mock.calls[0][1]).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.headers).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.headers).toHaveProperty('Content-Type');
            expect(fetchMock.mock.calls[0][1]?.headers?.['Content-Type']).toBe('application/x-www-form-urlencoded');

            const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
            expect(body).toBeInstanceOf(URLSearchParams);
            expect(body.get('password')).toBe('my-password');
            expect(body.get('client_id')).toBe('my-client-id');
            expect(body.get('response_type')).toBe('code id_token token');
            expect(body.get('scope')).toBe('my-scope');
            expect(body.get('username')).toBe('my-username');
            expect(body.get('password')).toBe('my-password');
        });
    });

    /**
     *
     */
    describe('default handling', () => {
        type ResponseType = { result: number };
        /**
         *
         */
        beforeEach(() => {
            fetchMock.doMock(
                JSON.stringify({
                    result: 42
                } as ResponseType),
                {
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );
        });

        /**
         *
         */
        it('check default post (string body)', async () => {
            const request = JSON.stringify({
                hello: 'world'
            });

            const sut = new RestHttp('http://url');
            const response = await sut.post(request, null, null);

            const result = (await response.json()) as ResponseType;

            expect(result.result).toBe(42);
            expect(response.headers.get('content-type')).toBe('application/json');
            expect(fetchMock.mock.calls[0][1]).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.body).toBe(request);
        });

        /**
         *
         */
        it('check default post (TextContent body)', async () => {
            const stringBody = JSON.stringify({
                hello: 'world'
            });
            const request = new TextContent(stringBody);

            const sut = new RestHttp('http://url');
            const response = await sut.post(request, null, null);

            const result = (await response.json()) as ResponseType;

            expect(result.result).toBe(42);
            expect(response.headers.get('content-type')).toBe('application/json');
            expect(fetchMock.mock.calls[0][1]).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.body).toBe(stringBody);
        });

        /**
         *
         */
        it('check default put (string body)', async () => {
            const request = JSON.stringify({
                hello: 'world'
            });

            const sut = new RestHttp('http://url');
            const response = await sut.put(request, null, null);

            const result = (await response.json()) as ResponseType;

            expect(result.result).toBe(42);
            expect(response.headers.get('content-type')).toBe('application/json');
            expect(fetchMock.mock.calls[0][1]).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.body).toBe(request);
        });

        /**
         *
         */
        it('check default put (TextContent body)', async () => {
            const stringBody = JSON.stringify({
                hello: 'world'
            });
            const request = new TextContent(stringBody);

            const sut = new RestHttp('http://url');
            const response = await sut.put(request, null, null);

            const result = (await response.json()) as ResponseType;

            expect(result.result).toBe(42);
            expect(response.headers.get('content-type')).toBe('application/json');
            expect(fetchMock.mock.calls[0][1]).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.body).toBe(stringBody);
        });

        /**
         *
         */
        it('check default post_param', async () => {
            const requestParam = {
                a: 'b',
                c: 'd'
            };

            const sut = new RestHttp('http://url');
            const response = await sut.post_param(requestParam, null, null);

            const result = (await response.json()) as ResponseType;

            expect(result.result).toBe(42);
            expect(response.headers.get('content-type')).toBe('application/json');

            const params = new URLSearchParams();
            params.set('a', 'b');
            params.set('c', 'd');

            expect(fetchMock.mock.calls[0][1]).toBeDefined();
            expect(fetchMock.mock.calls[0][1]?.body).toStrictEqual(params);
        });

        /**
         *
         */
        it('check execution info (post)', async () => {
            const requestParam = JSON.stringify([
                ['a', 'b'],
                ['c', 'd']
            ]);

            const sut = new RestHttp('http://url');
            await sut.post(requestParam, null, null);

            expect(JSON.stringify(sut.getExecutionInfo())).toBe(
                JSON.stringify({
                    url: 'http://url',
                    option: {
                        method: 'POST',
                        body: '[["a","b"],["c","d"]]',
                        headers: { 'Content-Type': 'application/json' },
                        mode: 'no-cors',
                        referrerPolicy: 'unsafe-url'
                    }
                })
            );
        });

        /**
         *
         */
        it('check execution info (post_param)', async () => {
            const requestParam = {
                a: 'b',
                c: 'd'
            };
            const sut = new RestHttp('http://url');
            await sut.post_param(requestParam, null, null);

            expect(JSON.stringify(sut.getExecutionInfo())).toBe(
                JSON.stringify({
                    url: 'http://url',
                    option: {
                        method: 'POST',
                        body: { a: 'b', c: 'd' },
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        mode: 'no-cors',
                        referrerPolicy: 'unsafe-url'
                    }
                })
            );
        });

        /**
         *
         */
        it('check execution info (form data)', async () => {
            const formData = {
                a: 'b',
                c: 'd'
            };
            const sut = new RestHttp('http://url');
            await sut.form_data(formData, null, null);

            expect(JSON.stringify(sut.getExecutionInfo()).replace(/[-]+\d+/g, '----1111')).toEqual(
                JSON.stringify({
                    url: 'http://url',
                    option: {
                        method: 'POST',
                        body: {
                            _overheadLength: 200,
                            _valueLength: 2,
                            _valuesToMeasure: [],
                            writable: false,
                            readable: true,
                            dataSize: 0,
                            maxDataSize: 2097152,
                            pauseStreams: true,
                            _released: false,
                            _streams: [
                                '----1111\r\nContent-Disposition: form-data; name="a"\r\n\r\n',
                                'b',
                                null,
                                '----1111\r\nContent-Disposition: form-data; name="c"\r\n\r\n',
                                'd',
                                null
                            ],
                            _currentStream: null,
                            _insideLoop: false,
                            _pendingNext: false,
                            _boundary: '----1111'
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        mode: 'no-cors',
                        referrerPolicy: 'unsafe-url'
                    }
                })
            );
        });
    });
});
