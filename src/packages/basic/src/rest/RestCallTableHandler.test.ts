import { RestCallTableHandler } from '@boart/basic';
import { MarkdownTableReader } from '@boart/core';
import { Store } from '@boart/core/src/store/Store';
import fetchMock from 'jest-fetch-mock';

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
                getAbsoluteUrl: (url: string) => url
            };
        }
    };
});

/**
 *
 */
beforeEach(() => {
    const spy = jest.spyOn(process, 'hrtime');
    spy.mockReturnValue([0, 2000000]);
    sut.handler.executionEngine.initContext();
    Store.instance.localStore.clear();
});

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

    expect(sut.handler.executionEngine.context.execution.data?.toJSON()).toEqual('{"b":2}');
    expect(sut.handler.executionEngine.context.execution.header?.toJSON()).toEqual(
        JSON.stringify({
            duration: '2.00', //
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        })
    );

    expect(fetchMock.mock.calls).toEqual([
        ['http://xxx', { headers: { 'Content-Type': 'application/json' }, method: 'GET', mode: 'no-cors', referrerPolicy: 'unsafe-url' }]
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
         | authentication | aaa        |`
    );

    await sut.handler.process(tableRows);
    expect(fetchMock.mock.calls).toEqual([
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
    Store.instance.localStore.put('bearer', 'aaa');
    fetchMock.doMock(JSON.stringify({ b: 2 }));

    const tableRows = MarkdownTableReader.convert(
        `|action          |value             |
         |----------------|------------------|
         | method:get     | http://xxx       |
         | authentication | $\{store:bearer} |`
    );

    await sut.handler.process(tableRows);
    expect(fetchMock.mock.calls).toEqual([
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
    Store.instance.localStore.put('authentication', 'bbb');
    fetchMock.doMock(JSON.stringify({ b: 2 }));
    const tableRows = MarkdownTableReader.convert(
        `|action          |value       |
         |----------------|------------|
         | method:get     | http://xxx |`
    );

    await sut.handler.process(tableRows);
    expect(fetchMock.mock.calls).toEqual([
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
it('default post', async () => {
    fetchMock.doMock(JSON.stringify({ b: 2 }));
    const tableRows = MarkdownTableReader.convert(
        `|action       |value       |
         |-------------|------------|
         | method:post | http://xxx |
         | payload     | {"a": 1}   |`
    );

    await sut.handler.process(tableRows);

    expect(sut.handler.executionEngine.context.execution.data?.toJSON()).toEqual('{"b":2}');
    expect(sut.handler.executionEngine.context.execution.header?.toJSON()).toEqual(
        JSON.stringify({
            duration: '2.00', //
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        })
    );
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
    expect(fetchMock.mock.calls).toEqual([
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
    expect(fetchMock.mock.calls).toEqual([
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
    expect(fetchMock.mock.calls).toEqual([
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

    expect(sut.handler.executionEngine.context.execution.data?.toJSON()).toEqual('{"b":2}');
    expect(sut.handler.executionEngine.context.execution.header?.toJSON()).toEqual(
        JSON.stringify({
            duration: '2.00', //
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        })
    );
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
    expect(fetchMock.mock.calls).toEqual([
        [
            'http://xxx',
            {
                body: '{"a":1}',
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
    expect(fetchMock.mock.calls).toEqual([
        [
            'http://xxx',
            {
                body: '{"a":1}',
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
    expect(fetchMock.mock.calls).toEqual([
        [
            'http://xxx',
            {
                body: '{"a":1}',
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
    expect(fetchMock.mock.calls).toEqual([
        [
            'http://xxx',
            {
                body: '{"a":1}',
                headers: { 'Content-Type': 'x' },
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
it('default post-param', async () => {
    fetchMock.doMock(JSON.stringify({ b: 2 }));
    const tableRows = MarkdownTableReader.convert(
        `|action              |value       |
         |--------------------|------------|
         | method:post-param  | http://xxx |
         | param#a            | 1          |`
    );

    await sut.handler.process(tableRows);
    expect(sut.handler.executionEngine.context.execution.data?.toJSON()).toEqual('{"b":2}');
    expect(sut.handler.executionEngine.context.execution.header?.toJSON()).toEqual(
        JSON.stringify({
            duration: '2.00', //
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        })
    );
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
    expect(sut.handler.executionEngine.context.execution.data?.toJSON()).toEqual('{"b":2}');
    expect(sut.handler.executionEngine.context.execution.header?.toJSON()).toEqual(
        JSON.stringify({
            duration: '2.00', //
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        })
    );
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
    expect(sut.handler.executionEngine.context.execution.data?.toJSON()).toEqual('{"b":2}');
    expect(sut.handler.executionEngine.context.execution.header?.toJSON()).toEqual(
        JSON.stringify({
            duration: '2.00', //
            statusText: 'OK',
            status: 200,
            headers: { 'content-type': 'text/plain;charset=UTF-8' }
        })
    );

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

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
        'payload cannot be parsed as a valid json\n{ "a": 1'
    );
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

    const result = Store.instance.testStore.get('resonse');
    expect(result.getValue()).toBe('{"b":2}');
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

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
        'error: expected\n\texpected: xxx\n\tactual: {"b":2}'
    );
});