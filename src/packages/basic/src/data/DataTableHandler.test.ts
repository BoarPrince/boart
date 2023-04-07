import fs from 'fs';

import { DataTableHandler } from '@boart/basic';
import { LocalContext, MarkdownTableReader, Runtime, RuntimeContext, StepContext, Store, TestContext } from '@boart/core';
import { StepReport } from '@boart/protocol';
import fetchMock from 'jest-fetch-mock';

// eslint-disable-next-line jest/require-hook
fetchMock.enableMocks();
const sut = new DataTableHandler();

/**
 *
 */
jest.mock<typeof import('@boart/core')>('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    return {
        __esModule: true,
        ...originalModule,
        UrlLoader: class {
            static instance = {
                getAbsoluteUrl: (url: string) => url
            };
        },
        EnvLoader: class {
            readMapping: () => void;
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
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('crypto', () => {
    return {
        randomUUID: () => 'x-x-x'
    };
});

/**
 *
 */
jest.mock('fs');

/**
 *
 */
describe('data:unit', () => {
    /**
     *
     */
    beforeEach(() => {
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
    it('default', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action | value     |
             |--------|-----------|
             | in     | i.n.p.u.t |
             | store  | out       |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toBe('i.n.p.u.t');
    });

    /**
     *
     */
    it('structured input', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action | value |
             |--------|-------|
             | in#a   | 1     |
             | store  | out   |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('multiple structured input', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action | value |
             |--------|-------|
             | in#a   | 1     |
             | in#b   | c     |
             | store  | out   |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ a: 1, b: 'c' });
    });

    /**
     *
     */
    it('multiple structured input with transform', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action          | value |
             |-----------------|-------|
             | in#a            | 1     |
             | transform:jpath | .a    |
             | store           | out   |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toBe(1);
    });

    /**
     *
     */
    it('multiple transform', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action          | value |
             |-----------------|-------|
             | in#a.b          | 1     |
             | transform:jpath | .a    |
             | transform:jpath | .b    |
             | store           | out   |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toBe(1);
    });

    /**
     *
     */
    it('multiple transform and out - 1', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action          | value |
             |-----------------|-------|
             | in#a.b          | 1     |
             | store           | out1  |
             | transform:jpath | .a    |
             | store           | out2  |
             | transform:jpath | .b    |
             | store           | out3  |`
        );

        await sut.handler.process(tableRows);

        const result1 = Store.instance.testStore.get('out1');
        expect(result1.valueOf()).toStrictEqual({ a: { b: 1 } });

        const result2 = Store.instance.testStore.get('out2');
        expect(result2.valueOf()).toStrictEqual({ b: 1 });

        const result3 = Store.instance.testStore.get('out3');
        expect(result3.valueOf()).toBe(1);
    });

    /**
     *
     */
    it('multiple transform and out - 2', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action          | value |
             |-----------------|-------|
             | in#a.b          | 1     |
             | transform:jpath | .a    |
             | store           | out1  |
             | transform:reset |       |
             | transform:jpath | .a.b  |
             | store           | out2  |`
        );

        await sut.handler.process(tableRows);

        const result1 = Store.instance.testStore.get('out1');
        expect(result1.valueOf()).toStrictEqual({ b: 1 });

        const result2 = Store.instance.testStore.get('out2');
        expect(result2.valueOf()).toBe(1);
    });

    /**
     *
     */
    it('structured out', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | in#a.a    | 1     |
             | in#a.b    | 2     |
             | store#a.a | out   |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toBe(1);
    });

    /**
     *
     */
    it('multiple structured out', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action    | value |
             |-----------|-------|
             | in#a.a    | 1     |
             | in#a.b    | 2     |
             | store#a.a | out1  |
             | store#a.b | out2  |`
        );

        await sut.handler.process(tableRows);

        const result1 = Store.instance.testStore.get('out1');
        expect(result1.valueOf()).toBe(1);

        const result2 = Store.instance.testStore.get('out2');
        expect(result2.valueOf()).toBe(2);
    });

    /**
     *
     */
    it('use store as input', async () => {
        Store.instance.testStore.put('data', { ab: 5 });

        const tableRows = MarkdownTableReader.convert(
            `| action | value          |
             |--------|----------------|
             | in     | \${store:data} |
             | store  | out            |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ ab: 5 });
    });

    /**
     *
     */
    it('use store as input and extend it', async () => {
        Store.instance.testStore.put('data', { ab: 5 });

        const tableRows = MarkdownTableReader.convert(
            `| action | value          |
             |--------|----------------|
             | in     | \${store:data} |
             | in#ac  | 3              |
             | store  | out            |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ ab: 5, ac: 3 });
    });

    /**
     *
     */
    it('use store as input and use transformation', async () => {
        Store.instance.testStore.put('data', { ab: 5 });

        const tableRows = MarkdownTableReader.convert(
            `| action          | value          |
             |-----------------|----------------|
             | in              | \${store:data} |
             | in#a.c.d        | 3              |
             | transform:jpath | .a.c           |
             | store           | out            |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ d: 3 });
    });

    /**
     *
     */
    it('with generator - uuid', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action  | value             |
             |---------|-------------------|
             | in#uuid | \${generate:uuid} |
             | store   | out               |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ uuid: 'x-x-x' });
    });

    /**
     *
     */
    it('with generator - random', async () => {
        jest.spyOn(global.Math, 'floor').mockReturnValue(5);

        const tableRows = MarkdownTableReader.convert(
            `| action    | value               |
             |-----------|---------------------|
             | in#random | \${generate:random} |
             | store     | out                 |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ random: 5555 });
    });

    /**
     *
     */
    it('with generator - random - string', async () => {
        jest.spyOn(global.Math, 'floor').mockReturnValue(5);

        const tableRows = MarkdownTableReader.convert(
            `| action    | value                 |
             |-----------|-----------------------|
             | in#random | -\${generate:random}- |
             | store     | out                   |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ random: '-5555-' });
    });

    /**
     *
     */
    it('with generator - random - with size', async () => {
        jest.spyOn(global.Math, 'floor').mockReturnValue(5);

        const tableRows = MarkdownTableReader.convert(
            `| action    | value                  |
         |-----------|------------------------|
         | in#random | \${generate:random:10} |
         | store     | out                    |`
        );

        await sut.handler.process(tableRows);

        const result = Store.instance.testStore.get('out');
        expect(result.valueOf()).toStrictEqual({ random: 5555555555 });
    });
});

/**
 *
 */
describe('data:unit repeat', () => {
    /**
     *
     */
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        (fs.readFileSync as jest.Mock).mockImplementation(() => '{}');
    });

    /**
     *
     */
    beforeEach(() => {
        Store.instance.testStore.clear();

        Runtime.instance.runtime.notifyStart({} as RuntimeContext);
        Runtime.instance.localRuntime.notifyStart({} as LocalContext);
        Runtime.instance.testRuntime.notifyStart({} as TestContext);
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
    it('repeat is defined, but still error', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action       | value          |
             |--------------|----------------|
             | in           | \${store:varX} |
             | repeat:wait  | 10             |
             | repeat:count | 3              |
             | expected     | foo            |`
        );

        Store.instance.testStore.put('varX', 'fo');

        jest.spyOn(global, 'setTimeout').mockImplementation((callback, ms) => {
            expect(ms).toBe(10);
            callback();
            return null;
        });

        await expect(sut.handler.process(tableRows)).rejects.toThrow('error: expected\n\texpected: foo\n\tactual: fo');
        expect(setTimeout).toHaveBeenCalledTimes(3);
    });

    /**
     *
     */
    it('repeat is defined, error is solved after the first repeat', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action          | value          |
             |-----------------|----------------|
             | in              | \${store:varX} |
             | repeat:wait:sec | 1              |
             | repeat:count    | 3              |
             | expected        | foo            |`
        );

        Store.instance.testStore.put('varX', 'fo');

        jest.spyOn(global, 'setTimeout').mockImplementation((callback, ms) => {
            expect(ms).toBe(1000);
            Store.instance.testStore.put('varX', 'foo');
            callback();
            return null;
        });

        await sut.handler.process(tableRows);
        expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    it('repeat is defined with description', async () => {
        const tableRows = MarkdownTableReader.convert(
            `| action          | value                 |
             |-----------------|-----------------------|
             | in              | \${store:varX}        |
             | repeat:wait     | 10                     |
             | repeat:count    | 3                     |
             | description     | this is a description |
             | expected        | foo                   |`
        );

        Store.instance.testStore.put('varX', 'fo');

        jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
            Store.instance.testStore.put('varX', 'foo');
            callback();
            return null;
        });

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.current.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        const report = writeFileMockCalls[0][1] as string;

        expect(JSON.parse(report)).toStrictEqual({
            id: 'id-id-id',
            status: 2,
            type: 'data handling',
            startTime: '2020-01-01T00:00:00.000Z',
            description: 'this is a description',
            input: { 'Data Handling (input)': { description: 'Data Handling (input)', type: 'json', data: 'foo' } },
            result: {},
            links: []
        });
    });
});
