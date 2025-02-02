import fs from 'fs';
import { URLSearchParams } from 'url';

import { MarkdownTableReader, Runtime, StepContext, Store, StoreMap, StepReport } from '@boart/core';
import fetchMock from 'jest-fetch-mock';
import RestAuthorizeTableHandler from './RestAuthorizeTableHandler';
import { initialized } from '..';

const sut = new RestAuthorizeTableHandler();

/**
 *
 */
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('@boart/core', () => {
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
    initialized();
});

/**
 *
 */
beforeEach(() => {
    fetchMock.enableMocks();
    Store.instance.testStore.clear();
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    Runtime.instance.stepRuntime.notifyStart({} as StepContext);

    process.env['environment_reports_data_dir'] = '.';
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
it('default password', async () => {
    fetchMock.doMock(JSON.stringify({ access_token: 'T.O.K.E.N' }));

    const tableRows = MarkdownTableReader.convert(
        `|action     |value            |
         |-----------|-----------------|
         | url       | /token          |
         | grantType | password        |
         | clientId  | c.l.i.e.n.t.I.d |
         | scope     | s.c.o.p.e       |
         | username  | u.s.e.r.n.a.m.e |
         | password  | p.a.s.s.w.o.r.d |`
    );

    await sut.handler.process(tableRows);

    expect(sut.handler.getExecutionEngine().context.execution.header.getValue()).toStrictEqual({
        duration: 0,
        retries: 1,
        option: {
            body: {
                client_id: 'c.l.i.e.n.t.I.d',
                grant_type: 'password',
                password: 'p.a.s.s.w.o.r.d',
                response_type: 'code id_token token',
                scope: 's.c.o.p.e',
                username: 'u.s.e.r.n.a.m.e'
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            mode: 'no-cors',
            referrerPolicy: 'unsafe-url'
        },
        url: '/token'
    });

    expect(fetchMock.mock.calls).toStrictEqual([
        [
            '/token',
            {
                method: 'POST',
                body: new URLSearchParams([
                    ['grant_type', 'password'],
                    ['client_id', 'c.l.i.e.n.t.I.d'],
                    ['response_type', 'code id_token token'],
                    ['scope', 's.c.o.p.e'],
                    ['username', 'u.s.e.r.n.a.m.e'],
                    ['password', 'p.a.s.s.w.o.r.d']
                ]),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                mode: 'no-cors',
                referrerPolicy: 'unsafe-url'
            }
        ]
    ]);
});

/**
 *
 */
it('token must be generated (default name)', async () => {
    fetchMock.doMock(JSON.stringify({ access_token: 'T.O.K.E.N' }));

    const tableRows = MarkdownTableReader.convert(
        `|action     |value            |
         |-----------|-----------------|
         | url       | /token          |
         | grantType | password        |
         | clientId  | c.l.i.e.n.t.I.d |
         | scope     | s.c.o.p.e       |
         | username  | u.s.e.r.n.a.m.e |
         | password  | p.a.s.s.w.o.r.d |`
    );

    await sut.handler.process(tableRows);

    const astAuthorization = StoreMap.getStoreIdentifier('authorization');
    expect(sut.handler.getExecutionEngine().context.execution.token).toBe('T.O.K.E.N');
    expect(Store.instance.testStore.get(astAuthorization).valueOf()).toBe('T.O.K.E.N');
});

/**
 *
 */
it('token must be generated (custom name)', async () => {
    fetchMock.doMock(JSON.stringify({ access_token: 'T.O.K.E.N' }));

    const tableRows = MarkdownTableReader.convert(
        `|action         |value            |
         |---------------|-----------------|
         | url           | /token          |
         | grantType     | password        |
         | clientId      | c.l.i.e.n.t.I.d |
         | scope         | s.c.o.p.e       |
         | username      | u.s.e.r.n.a.m.e |
         | password      | p.a.s.s.w.o.r.d |
         | store         | XauthX          |`
    );

    await sut.handler.process(tableRows);

    expect(sut.handler.getExecutionEngine().context.execution.token).toBe('T.O.K.E.N');
    expect(Store.instance.testStore.get(StoreMap.getStoreIdentifier('authorization'))).toBeNull();
    expect(Store.instance.testStore.get(StoreMap.getStoreIdentifier('XauthX')).valueOf()).toBe('T.O.K.E.N');
});

/**
 *
 */
it('default client_credential', async () => {
    fetchMock.doMock(JSON.stringify({ access_token: 'T.O.K.E.N' }));

    const tableRows = MarkdownTableReader.convert(
        `|action        |value               |
         |--------------|--------------------|
         | url          | /token             |
         | grantType    | client_credentials |
         | clientId     | c.l.i.e.n.t.I.d    |
         | clientSecret | s.e.c.r.e.t        |
         | scope        | s.c.o.p.e          |`
    );

    await sut.handler.process(tableRows);

    expect(sut.handler.getExecutionEngine().context.execution.header.getValue()).toStrictEqual({
        duration: 0,
        retries: 1,
        option: {
            body: {
                client_id: 'c.l.i.e.n.t.I.d',
                client_secret: 's.e.c.r.e.t',
                grant_type: 'client_credentials',
                response_type: 'code id_token token',
                scope: 's.c.o.p.e'
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            mode: 'no-cors',
            referrerPolicy: 'unsafe-url'
        },
        url: '/token'
    });

    expect(fetchMock.mock.calls).toStrictEqual([
        [
            '/token',
            {
                method: 'POST',
                body: new URLSearchParams([
                    ['grant_type', 'client_credentials'],
                    ['client_id', 'c.l.i.e.n.t.I.d'],
                    ['response_type', 'code id_token token'],
                    ['scope', 's.c.o.p.e'],
                    ['client_secret', 's.e.c.r.e.t']
                ]),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                mode: 'no-cors',
                referrerPolicy: 'unsafe-url'
            }
        ]
    ]);
});

/**
 *
 */
it('grantType:client_credential depends on', async () => {
    const tableRows = MarkdownTableReader.convert(
        `|action     |value               |
         |-----------|--------------------|
         | url       | /token             |
         | grantType | client_credentials |
         | clientId  | c.l.i.e.n.t.I.d    |
         | scope     | s.c.o.p.e          |`
    );

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrow(
        "key 'grantType:client_credentials' depends on 'clientSecret', but it does not exist!"
    );
});

/**
 *
 */
it('grantType:password depends on', async () => {
    const tableRows = MarkdownTableReader.convert(
        `|action     |value            |
         |-----------|-----------------|
         | url       | /token          |
         | grantType | password        |
         | username  | u.s.e.r.n.a.m.e |
         | password  | p.a.s.s.w.o.r.d |`
    );

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrow(
        "key 'grantType:password' depends on 'clientId', but it does not exist!"
    );
});

/**
 *
 */
it('reporting', async () => {
    fetchMock.doMock(JSON.stringify({ access_token: 'T.O.K.E.N' }));

    const tableRows = MarkdownTableReader.convert(
        `|action       |value            |
         |-------------|-----------------|
         | url         | /token          |
         | grantType   | password        |
         | clientId    | c.l.i.e.n.t.I.d |
         | scope       | s.c.o.p.e       |
         | username    | u.s.e.r.n.a.m.e |
         | password    | p.a.s.s.w.o.r.d |
         | description | test desc       |`
    );

    await sut.handler.process(tableRows);

    jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
    Runtime.instance.stepRuntime.currentContext.id = 'id-id-id';

    StepReport.instance.report();

    const writeFileMockCalls = (fs.writeFile as unknown as jest.Mock).mock.calls;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(JSON.parse(writeFileMockCalls[0][1] as string)).toStrictEqual({
        description: 'test desc',
        id: 'id-id-id',
        input: {
            'Rest authorize (config)': {
                data: {
                    clientId: 'c.l.i.e.n.t.I.d',
                    clientSecret: '',
                    grantType: 'password',
                    password: 'p.a.s.s.w.o.r.d',
                    retryCount: 2,
                    retryPause: 5,
                    scope: 's.c.o.p.e',
                    url: '/token',
                    username: 'u.s.e.r.n.a.m.e'
                },
                description: 'Rest authorize (config)',
                type: 'json'
            }
        },
        links: [],
        result: {
            'Rest authorize (curl)': {
                data: expect.anything() as string,
                description: 'Rest authorize (curl)',
                type: 'text'
            },
            'Rest authorize (data - token)': {
                data: 'T.O.K.E.N',
                description: 'Rest authorize (data - token)',
                type: 'json'
            },
            'Rest authorize (header)': {
                data: {
                    duration: 0,
                    option: {
                        body: {
                            client_id: 'c.l.i.e.n.t.I.d',
                            grant_type: 'password',
                            password: 'p.a.s.s.w.o.r.d',
                            response_type: 'code id_token token',
                            scope: 's.c.o.p.e',
                            username: 'u.s.e.r.n.a.m.e'
                        },
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        method: 'POST',
                        mode: 'no-cors',
                        referrerPolicy: 'unsafe-url'
                    },
                    retries: 1,
                    url: '/token'
                },
                description: 'Rest authorize (header)',
                type: 'json'
            },
            'Rest authorize (token)': {
                data: 'T.O.K.E.N',
                description: 'Rest authorize (token)',
                type: 'json'
            }
        },
        startTime: '2020-01-01T00:00:00.000Z',
        status: 2,
        type: 'restAuthorize'
    });
});
