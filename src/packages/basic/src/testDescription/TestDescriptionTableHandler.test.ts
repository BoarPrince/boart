import fs from 'fs';

import { TestDescriptionTableHandler } from '@boart/basic';
import { MarkdownTableReader, Runtime, TestContext } from '@boart/core';
import { TestReport } from '@boart/protocol';

const sut = new TestDescriptionTableHandler();

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
            static instance = {
                mapReportData: (filename: string) => filename,
                get: (env_var: string) => env_var
            };
            static readSettings = (): Record<string, string> => {
                return {};
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
beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    Runtime.instance.testRuntime.notifyStart({} as TestContext);
});

/**
 *
 */
afterEach(() => {
    sut.handler.getExecutionEngine().context.config.failureDescription = '';
    sut.handler.getExecutionEngine().context.config.description = '';
    sut.handler.getExecutionEngine().context.config.priority = '';
    sut.handler.getExecutionEngine().context.config.ticket = '';

    TestReport.instance.report();
});

/**
 *
 */
jest.mock('fs');

/**
 *
 */
describe('description', () => {
    /**
     *
     */
    it('default description', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | medium |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
    });

    /**
     *
     */
    it('with ticket', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | medium |
             | ticket      | t-01   |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('t-01');
    });

    /**
     *
     */
    it('with two tickets - one row', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value       |
             |-------------|------------|
             | description | desc       |
             | priority    | medium     |
             | ticket      | t-01, t-02 |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('t-01, t-02');
    });

    /**
     *
     */
    it('with two tickets - two rows', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | medium |
             | ticket      | t-01   |
             | ticket      | t-02   |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('t-01,t-02');
    });

    /**
     *
     */
    it('with two tickets - two rows, but one definition, ', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | medium |
             | ticket      | t-01   |
             |             | t-02   |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('t-01,t-02');
    });

    /**
     *
     */
    it('with ticket - other provider - check report', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value            |
             |-------------|-----------------|
             | description | desc            |
             | priority    | medium          |
             | ticket      | provider-x:t-01 |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('provider-x:t-01');

        Runtime.instance.testRuntime.current.id = 'id-id-id';
        TestReport.instance.report();
        expect(fs.writeFile).toBeCalledWith(
            'id-id-id.json',
            JSON.stringify({
                id: 'id-id-id',
                number: '',
                name: '',
                status: 2,
                priority: 1,
                startTime: '2020-01-01T00:00:00.000Z',
                tickets: [{ id: 't-01', link: 'ticket_link_provider-x', source: 'Provider-x' }],
                descriptions: 'desc',
                failureDescription: ''
            }),
            'utf-8',
            expect.any(Function)
        );
    });

    /**
     *
     */
    it('with ticket - check report', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | medium |
             | ticket      | t-01   |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('t-01');

        Runtime.instance.testRuntime.current.id = 'id-id-id';
        TestReport.instance.report();
        expect(fs.writeFile).toBeCalledWith(
            'id-id-id.json',
            JSON.stringify({
                id: 'id-id-id',
                number: '',
                name: '',
                status: 2,
                priority: 1,
                startTime: '2020-01-01T00:00:00.000Z',
                tickets: [{ id: 't-01', link: 'ticket_link_default', source: 'ticket_source_default' }],
                descriptions: 'desc',
                failureDescription: ''
            }),
            'utf-8',
            expect.any(Function)
        );
    });

    /**
     *
     */
    it('with multiple descriptions', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc1  |
             | description | desc2  |
             | description | desc3  |
             |             | desc4  |
             | priority    | medium |`
        );

        await sut.handler.process(tableRows);

        expect(sut.handler.getExecutionEngine().context.config.description).toEqual('desc1\ndesc2\ndesc3\ndesc4');
        expect(sut.handler.getExecutionEngine().context.config.priority).toEqual('medium');
        expect(sut.handler.getExecutionEngine().context.config.ticket).toEqual('');

        Runtime.instance.testRuntime.current.id = 'id-id-id';
        TestReport.instance.report();
        expect(fs.writeFile).toBeCalledWith(
            'id-id-id.json',
            JSON.stringify({
                id: 'id-id-id',
                number: '',
                name: '',
                status: 2,
                priority: 1,
                startTime: '2020-01-01T00:00:00.000Z',
                tickets: [],
                descriptions: 'desc1\ndesc2\ndesc3\ndesc4',
                failureDescription: ''
            }),
            'utf-8',
            expect.any(Function)
        );
    });
});

/**
 *
 */
describe('error handling', () => {
    /**
     *
     */
    it('missing priority', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value  |
             |-------------|-------|
             | description | desc  |`
        );

        await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError("Key 'priority' is required, but it's missing");
    });

    /**
     *
     */
    it('missing description', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action    |value   |
             |----------|--------|
             | priority | medium |`
        );

        await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
            "Key 'description' is required, but it's missing"
        );
    });

    /**
     *
     */
    it('priority must be unique', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | xx1    |
             | priority    | xx2    |`
        );

        await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
            "Validator: 'UniqueValidator' => key 'priority' occurs 2 times"
        );
    });

    /**
     *
     */
    it('wrong priority value', async () => {
        const tableRows = MarkdownTableReader.convert(
            `|action       |value   |
             |-------------|--------|
             | description | desc   |
             | priority    | xxx    |`
        );

        await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
            "Value 'xxx' of key/column: 'priority/value' is not defined. Allowed is 'low' or 'medium' or 'high'"
        );
    });
});
