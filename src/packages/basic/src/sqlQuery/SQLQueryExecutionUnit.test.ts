import fs from 'fs';

import { ContentType, MarkdownTableReader, Runtime, StepContext } from '@boart/core';
import { StepReport } from '@boart/protocol';
import SQLQueryTableHandler from './SQLQueryTableHandler';
import { basicInitialize } from '..';

const sut = new SQLQueryTableHandler();

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
const queryResultMock = {
    getStringOrObjectArray: jest.fn<ContentType, []>(),
    affectedRows: [1],
    rowCount: 1
};

/**
 *
 */
jest.mock('@boart/execution', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/execution');

    return {
        __esModule: true,
        ...originalModule,
        MSSQLHandler: jest.fn().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => Promise.resolve(queryResultMock))
            };
        })
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
describe('text result', () => {
    /**
     *
     */
    it('default', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() => 'simple text');

        const tableRows = MarkdownTableReader.convert(
            `|action    |value                     |
             |----------|--------------------------|
             | database | db                       |
             | query    | select text from unknown |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data.valueOf()).toBe('simple text');
    });

    /**
     *
     */
    it('json text', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() =>
            JSON.stringify({
                a: 1
            })
        );

        const tableRows = MarkdownTableReader.convert(
            `|action    |value               |
             |----------|--------------------|
             | database | db                 |
             | query    | select * from json |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('json text - array 1', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() =>
            JSON.stringify([
                {
                    a: 1
                }
            ])
        );

        const tableRows = MarkdownTableReader.convert(
            `|action    |value               |
             |----------|--------------------|
             | database | db                 |
             | query    | select * from json |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('json text - array multiple', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() =>
            JSON.stringify([
                {
                    a: 1
                },
                {
                    b: 1
                }
            ])
        );

        const tableRows = MarkdownTableReader.convert(
            `|action    |value               |
             |----------|--------------------|
             | database | db                 |
             | query    | select * from json |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data.valueOf()).toStrictEqual([{ a: 1 }, { b: 1 }]);
    });

    /**
     *
     */
    it('json text - number', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() => '1');

        const tableRows = MarkdownTableReader.convert(
            `|action    |value               |
             |----------|--------------------|
             | database | db                 |
             | query    | select * from json |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data.valueOf()).toStrictEqual('1');
    });

    /**
     *
     */
    it('json text - boolean', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() => 'true');

        const tableRows = MarkdownTableReader.convert(
            `|action    |value               |
             |----------|--------------------|
             | database | db                 |
             | query    | select * from json |`
        );

        await sut.handler.process(tableRows);
        expect(sut.handler.getExecutionEngine().context.execution.data.valueOf()).toStrictEqual('true');
    });

    /**
     *
     */
    it('json text with report', async () => {
        queryResultMock.getStringOrObjectArray.mockImplementation(() =>
            JSON.stringify([
                {
                    a: 1
                }
            ])
        );

        const tableRows = MarkdownTableReader.convert(
            `|action       |value               |
             |-------------|--------------------|
             | database    | db                 |
             | description | test desc          |
             | query       | select * from json |`
        );

        await sut.handler.process(tableRows);

        Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';
        StepReport.instance.report();

        const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
        expect(writeFileMockCalls.length).toBe(1);
        expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
            description: 'test desc',
            id: 'id-id-id',
            input: {
                'SQL Query (query)': {
                    data: 'select * from json',
                    description: 'SQL Query (query)',
                    type: 'text'
                }
            },
            links: [],
            result: {
                'SQL Query result (header)': {
                    data: {
                        database: 'db',
                        duration: 0,
                        hostname: 'mssql_hostname',
                        rows: 1,
                        type: 'mssql'
                    },
                    description: 'SQL Query result (header)',
                    type: 'json'
                },
                'SQL Query result (paylaod)': {
                    data: {
                        a: 1
                    },
                    description: 'SQL Query result (paylaod)',
                    type: 'json'
                }
            },
            startTime: '2020-01-01T00:00:00.000Z',
            status: 2,
            type: 'mssqlQuery'
        });
    });
});
