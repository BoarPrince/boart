import fs from 'fs';

import { DataContent, MarkdownTableReader, Runtime, StepContext, Store, StoreMap } from '@boart/core';
import { StepReport } from '@boart/protocol';
import fetchMock from 'jest-fetch-mock';
import RestCallTableHandler from './RestCallTableHandler';
import { basicInitialize } from '..';

fetchMock.enableMocks();
const sut = new RestCallTableHandler();

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    return {
        __esModule: true,
        ...originalModule,
        UrlLoader: class {
            static instance = {
                url: (url: string) => url
            };
        },
        EnvLoader: class {
            static instance = {
                mapReportData: (filename: string) => filename,
                get: (key: string) => key
            };
        },
        TextLanguageHandler: class {
            static instance = {
                language: {
                    subscribe: () => null
                }
            };
        }
    };
});

/**
 *
 */
jest.mock('fs');

/**
 *
 */
beforeAll(() => {
  basicInitialize();
});

/**
 *
*/
beforeEach(() => {
    Store.instance.localStore.clear();
    Store.instance.testStore.clear();
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    Runtime.instance.stepRuntime.notifyStart({} as StepContext);
});

/**
 *
 */
afterEach(() => {
    StepReport.instance.report();
});

/**
 *
 */
describe('get', () => {
    /**
     *
     */
    it('default get', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:get  | http://xxx |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data?.toJSON()).toBe('{"b":2}');
        expect(sut.handler.getExecutionEngine().context.execution.header?.valueOf()).toStrictEqual({
            duration: 0,
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });

        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                { headers: { 'Content-Type': 'application/json' }, method: 'GET', mode: 'no-cors', referrerPolicy: 'unsafe-url' }
            ]
        ]);
    });

    /**
     *
     */
    it('default get with bearer', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action          |value       |
             |----------------|------------|
             | method:get     | http://xxx |
             | authorization  | aaa        |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    headers: { Authorization: 'Bearer aaa', 'Content-Type': 'application/json' },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default get with bearer from store', async () => {
        Store.instance.localStore.put(StoreMap.getStoreIdentifier('bearer'), 'aaa');
        fetchMock.doMock(JSON.stringify({ b: 2 }));

        const tableRows = MarkdownTableReader.convert(
            `|action          |value             |
             |----------------|------------------|
             | method:get     | http://xxx       |
             | authorization  | \${store:bearer} |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    headers: { Authorization: 'Bearer aaa', 'Content-Type': 'application/json' },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default get with bearer from default', async () => {
        Store.instance.localStore.put(StoreMap.getStoreIdentifier('authorization'), 'bbb');
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action          |value       |
             |----------------|------------|
             | method:get     | http://xxx |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    headers: {
                        Authorization: 'Bearer bbb',
                        'Content-Type': 'application/json'
                    },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('get with bearer, when store was initialized', async () => {
        Store.instance.testStore.put(StoreMap.getStoreIdentifier('authorization'), 't.o.k.e.n');

        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action          |value       |
             |----------------|------------|
             | method:get     | http://xxx |`
        );

        const context = await sut.handler.process(tableRows);

        expect(context.preExecution.authorization).toBe('t.o.k.e.n');
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    headers: { Authorization: 'Bearer t.o.k.e.n', 'Content-Type': 'application/json' },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('one query parameter', async () => {
        Store.instance.testStore.put(StoreMap.getStoreIdentifier('authorization'), 't.o.k.e.n');

        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action          |value       |
             |----------------|------------|
             | query#search   | aaa        |
             | method:get     | http://xxx |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx?search=aaa',
                {
                    headers: { Authorization: 'Bearer t.o.k.e.n', 'Content-Type': 'application/json' },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('two query parameter', async () => {
        Store.instance.testStore.put(StoreMap.getStoreIdentifier('authorization'), 't.o.k.e.n');

        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action          |value       |
             |----------------|------------|
             | query#search   | aaa        |
             | query#size     | 5          |
             | method:get     | http://xxx |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx?search=aaa&size=5',
                {
                    headers: { Authorization: 'Bearer t.o.k.e.n', 'Content-Type': 'application/json' },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('query parameter with special characater', async () => {
        Store.instance.testStore.put(StoreMap.getStoreIdentifier('authorization'), 't.o.k.e.n');

        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action          |value       |
             |----------------|------------|
             | query#search   | ?&=#       |
             | method:get     | http://xxx |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx?search=%3F%26%3D%23',
                {
                    headers: { Authorization: 'Bearer t.o.k.e.n', 'Content-Type': 'application/json' },
                    method: 'GET',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });
});

/**
 *
 */
describe('post', () => {
    /**
     *
     */
    it('default post', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:post | http://xxx |
             | payload     | {"a": 1}   |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data?.toJSON()).toBe('{"b":2}');
        expect(sut.handler.getExecutionEngine().context.execution.header?.valueOf()).toStrictEqual({
            duration: 0,
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });
    });

    /**
     *
     */
    it('default post with structured payload', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:post | http://xxx |
             | payload#a   | 1        |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a":1}',
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default post with object payload and structured payload', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:post | http://xxx |
             | payload     | {"a": 1}   |
             | payload#b   | 2          |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a":1,"b":2}',
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default post, override property', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value             |
             |-------------|------------------|
             | method:post | http://xxx       |
             | payload     | {"a": 1, "b": 2} |
             | payload#b   | {"c": 3}         |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a":1,"b":{"c":3}}',
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });
});

/**
 *
 */
describe('put', () => {
    /**
     *
     */
    it('default put', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:put  | http://xxx |
             | payload     | {"a": 1}   |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.execution.data?.toJSON()).toEqual('{"b":2}');
        expect(sut.handler.getExecutionEngine().context.execution.header?.valueOf()).toEqual({
            duration: 0,
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });
    });

    /**
     *
     */
    it('default put with additional header', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:put  | http://xxx |
             | header      | {"c": 1}   |
             | payload     | {"a": 1}   |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a": 1}',
                    headers: { 'Content-Type': 'application/json', c: 1 },
                    method: 'PUT',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default put with additional structured header', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:put  | http://xxx |
             | header#c    | 1          |
             | payload     | {"a": 1}   |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a": 1}',
                    headers: { 'Content-Type': 'application/json', c: 1 },
                    method: 'PUT',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default put with additional structured header and object header', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:put  | http://xxx |
             | header      | {"d": 2}   |
             | header#c    | 1          |
             | payload     | {"a": 1}   |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a": 1}',
                    headers: { 'Content-Type': 'application/json', c: 1, d: 2 },
                    method: 'PUT',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('default put with overridden header', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value                    |
             |-------------|-------------------------|
             | method:put  | http://xxx              |
             | header      | {"Content-Type": "x"}   |
             | payload     | {"a": 1}                |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toStrictEqual([
            [
                'http://xxx',
                {
                    body: '{"a": 1}',
                    headers: { 'Content-Type': 'x' },
                    method: 'PUT',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });
});

/**
 *
 */
describe('post-param', () => {
    /**
     *
     */
    it('default post-param', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action              |value       |
             |--------------------|------------|
             | method:post-param  | http://xxx |
             | param#a            | 1          |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data?.toJSON()).toEqual('{"b":2}');
        expect(sut.handler.getExecutionEngine().context.execution.header?.valueOf()).toEqual({
            duration: 0,
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });
        expect(fetchMock.mock.calls).toEqual([
            [
                'http://xxx',
                {
                    body: new URLSearchParams({
                        a: '1'
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('post-param with payload', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action              |value       |
             |--------------------|------------|
             | method:post-param  | http://xxx |
             | payload            | { "a": 1}  |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data?.toJSON()).toEqual('{"b":2}');
        expect(sut.handler.getExecutionEngine().context.execution.header?.valueOf()).toEqual({
            duration: 0,
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });
        expect(fetchMock.mock.calls).toEqual([
            [
                'http://xxx',
                {
                    body: new URLSearchParams({
                        a: '1'
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('post-param with payload and param selector', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action              |value       |
             |--------------------|------------|
             | method:post-param  | http://xxx |
             | payload            | { "a": 1}  |
             | param#b            | 2          |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toEqual([
            [
                'http://xxx',
                {
                    body: new URLSearchParams({
                        b: '2',
                        a: '1'
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('post-param with structured payload and param selector', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action              |value       |
             |--------------------|------------|
             | method:post-param  | http://xxx |
             | payload#a          | 1          |
             | param#b            | 2          |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toEqual([
            [
                'http://xxx',
                {
                    body: new URLSearchParams({
                        b: '2',
                        a: '1'
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });

    /**
     *
     */
    it('post-param with payload, structured payload and param selector', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action              |value       |
             |--------------------|------------|
             | method:post-param  | http://xxx |
             | payload            | {"b":2}    |
             | payload#a          | 1          |
             | param#c            | 3          |`
        );

        await sut.handler.process(tableRows);
        expect(fetchMock.mock.calls).toEqual([
            [
                'http://xxx',
                {
                    body: new URLSearchParams({
                        c: '3',
                        b: '2',
                        a: '1'
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    method: 'POST',
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ]
        ]);
    });
});

/**
 *
 */
describe('form-data', () => {
    /**
     *
     */
    it('default form-data', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action            |value       |
             |------------------|------------|
             | method:form-data | http://xxx |
             | form-data#a      | 1          |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data?.toJSON()).toEqual('{"b":2}');
        expect(sut.handler.getExecutionEngine().context.execution.header?.valueOf()).toEqual({
            duration: 0,
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });

        expect(JSON.stringify(fetchMock.mock.calls[0]).replace(/[-]+\d+/g, '----1111')).toBe(
            JSON.stringify([
                'http://xxx',
                {
                    method: 'POST',
                    body: {
                        _overheadLength: 100,
                        _valueLength: 1,
                        _valuesToMeasure: [],
                        writable: false,
                        readable: true,
                        dataSize: 0,
                        maxDataSize: 2097152,
                        pauseStreams: true,
                        _released: false,
                        _streams: ['----1111\r\nContent-Disposition: form-data; name="a"\r\n\r\n', '1', null],
                        _currentStream: null,
                        _insideLoop: false,
                        _pendingNext: false,
                        _boundary: '----1111',
                        _events: {},
                        _eventsCount: 1
                    },
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ])
        );
    });

    /**
     *
     */
    it('default form-data - but using parameter', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action            |value       |
             |------------------|------------|
             | method:form-data | http://xxx |
             | form-data:a      | 1          |`
        );

        await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
            "'undefined': key 'form-data:a' must have a selector!"
        );
    });

    /**
     *
     */
    it('form-data with payload', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action            |value       |
             |------------------|------------|
             | method:form-data | http://xxx |
             | payload          | { "a": 1}  |`
        );

        await sut.handler.process(tableRows);

        expect(JSON.stringify(fetchMock.mock.calls[0]).replace(/[-]+\d+/g, '----1111')).toBe(
            JSON.stringify([
                'http://xxx',
                {
                    method: 'POST',
                    body: {
                        _overheadLength: 100,
                        _valueLength: 1,
                        _valuesToMeasure: [],
                        writable: false,
                        readable: true,
                        dataSize: 0,
                        maxDataSize: 2097152,
                        pauseStreams: true,
                        _released: false,
                        _streams: ['----1111\r\nContent-Disposition: form-data; name="a"\r\n\r\n', '1', null],
                        _currentStream: null,
                        _insideLoop: false,
                        _pendingNext: false,
                        _boundary: '----1111',
                        _events: {},
                        _eventsCount: 1
                    },
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ])
        );
    });

    /**
     *
     */
    it('form-data with structurd payload', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action            |value       |
             |------------------|------------|
             | method:form-data | http://xxx |
             | payload#a        | 1          |`
        );

        await sut.handler.process(tableRows);

        expect(JSON.stringify(fetchMock.mock.calls[0]).replace(/[-]+\d+/g, '----1111')).toBe(
            JSON.stringify([
                'http://xxx',
                {
                    method: 'POST',
                    body: {
                        _overheadLength: 100,
                        _valueLength: 1,
                        _valuesToMeasure: [],
                        writable: false,
                        readable: true,
                        dataSize: 0,
                        maxDataSize: 2097152,
                        pauseStreams: true,
                        _released: false,
                        _streams: ['----1111\r\nContent-Disposition: form-data; name="a"\r\n\r\n', '1', null],
                        _currentStream: null,
                        _insideLoop: false,
                        _pendingNext: false,
                        _boundary: '----1111',
                        _events: {},
                        _eventsCount: 1
                    },
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    referrerPolicy: 'unsafe-url'
                }
            ])
        );
    });

    /**
     *
     */
    it('form-data with invalid payload', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action            |value       |
             |------------------|------------|
             | method:form-data | http://xxx |
             | payload          | { "a": 1   |`
        );

        await expect(sut.handler.process(tableRows)).rejects.toThrowError('payload cannot be parsed as a valid json\n{ "a": 1');
    });
});

/**
 *
 */
describe('report', () => {
    /**
     *
     */
    it('report must be written', async () => {
        fetchMock.doMock(JSON.stringify({ b: 2 }));
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | method:get  | http://xxx |
             | description | test desc  |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        expect(writeFileMockCalls.length).toBe(1);
        expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
            id: 'id-id-id',
            status: 2,
            type: 'restCall',
            startTime: '2020-01-01T00:00:00.000Z',
            description: 'test desc',
            input: {
                'Rest call': {
                    description: 'Rest call',
                    type: 'json',
                    data: {
                        url: 'http://xxx',
                        option: {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                            mode: 'no-cors',
                            referrerPolicy: 'unsafe-url'
                        }
                    }
                },
                'Rest call (curl)': {
                    description: 'Rest call (curl)',
                    type: 'text',
                    data: "curl -i -X GET 'http://xxx' \\\n\t-H 'Content-Type: application/json'"
                },
                'Rest call (payload)': {
                    description: 'Rest call (payload)',
                    type: 'json'
                }
            },
            links: [],
            result: {
                'Rest call result (header)': {
                    description: 'Rest call result (header)',
                    type: 'json',
                    data: { duration: 0, statusText: 'OK', status: 200, headers: { 'content-type': 'text/plain;charset=UTF-8' } }
                },
                'Rest call result (paylaod)': { description: 'Rest call result (paylaod)', type: 'json', data: { b: 2 } }
            }
        });
    });
});

/**
 *
 */
it('default store', async () => {
    fetchMock.doMock(JSON.stringify({ b: 2 }));
    const tableRows = MarkdownTableReader.convert(
        `|action       |value       |
         |-------------|------------|
         | method:get  | http://xxx |
         | store       | resonse    |`
    );

    await sut.handler.process(tableRows);

    const result = Store.instance.testStore.get(StoreMap.getStoreIdentifier('resonse')) as DataContent;
    expect(result.getValue()).toStrictEqual({ b: 2 });
});

/**
 *
 */
it('default expected - wrong', async () => {
    fetchMock.doMock(JSON.stringify({ b: 2 }));
    const tableRows = MarkdownTableReader.convert(
        `|action       |value       |
         |-------------|------------|
         | method:get  | http://xxx |
         | expected    | xxx        |`
    );

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrow('error: expected\n\texpected: xxx\n\tactual: {"b":2}');
});

/**
 *
 */
it('context must be re-created', async () => {
    let tableRows = MarkdownTableReader.convert(
        `|action       |value       |
         |-------------|------------|
         | method:post | http://xxx |
         | payload     | {"a": 1}   |`
    );

    let context = await sut.handler.process(tableRows);
    StepReport.instance.report();
    expect(context.preExecution.payload).toBe('{"a": 1}');

    tableRows = MarkdownTableReader.convert(
        `|action       |value       |
         |-------------|------------|
         | method:get  | http://xxx |`
    );

    context = await sut.handler.process(tableRows);
    expect(context.preExecution.payload).toBeNull();
});

/**
 *
 */
it('use context replace', async () => {
    fetchMock.doMock('ok');
    const tableRows = MarkdownTableReader.convert(
        `|action       |value                  |
         |-------------|-----------------------|
         | method:post | http://xxx            |
         | payload     | {"a": 1}              |
         | payload#b   | \${context:payload#a} |`
    );

    const context = await sut.handler.process(tableRows);

    expect(context.preExecution.payload.valueOf()).toStrictEqual({ a: 1, b: 1 });
    expect(fetchMock.mock.calls).toStrictEqual([
        [
            'http://xxx',
            {
                body: '{"a":1,"b":1}',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                mode: 'no-cors',
                referrerPolicy: 'unsafe-url'
            }
        ]
    ]);
});
