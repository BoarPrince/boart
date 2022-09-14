import fs from 'fs';
import { URLSearchParams } from 'url';

import { RestAuthorizeTableHandler } from '@boart/basic';
import { MarkdownTableReader, Runtime, StepContext } from '@boart/core';
import { Store } from '@boart/core/src/store/Store';
import { StepReport } from '@boart/protocol';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();
const sut = new RestAuthorizeTableHandler();

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
        },
        EnvLoader: class {
            static instance = {
                mapReportData: (filename: string) => filename,
                get: (key: string) => key
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
beforeEach(() => {
    sut.handler.executionEngine.initContext();
    Store.instance.localStore.clear();
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

// | url        | /token                                                                                                                                   |
// | grant_type | password                                                                                                                                 |
// | scope      | openid locations_api fleet_profile fleet_role fleet_apiscope app_api jitpay.role fleet_apiscope email idgen_api ds_api mobilefileagg_api |
// | client_id  | jitfleet_portal                                                                                                                          |
// | username   | ${env:admin_login_user}                                                                                                                  |
// | password   | ${env:admin_login_password}                                                                                                              |
// | retry      | 2                                                                                                                                        |

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

    expect(sut.handler.executionEngine.context.execution.data.getValue()).toEqual('T.O.K.E.N');
    expect(sut.handler.executionEngine.context.execution.header.getValue()).toEqual({
        decoded: '-- decoding not possible --',
        duration: '0.00',
        retries: 1,
        trace: {
            option: {
                body: {
                    client_id: 'c.l.i.e.n.t.I.d',
                    grant_type: 'password',
                    response_type: 'code id_token token',
                    scope: 's.c.o.p.e',
                    username: 'p.a.s.s.w.o.r.d'
                },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'POST',
                mode: 'no-cors',
                referrerPolicy: 'unsafe-url'
            },
            url: '/token'
        }
    });

    expect(fetchMock.mock.calls).toEqual([
        [
            '/token',
            {
                method: 'POST',
                body: new URLSearchParams([
                    ['grant_type', 'password'],
                    ['client_id', 'c.l.i.e.n.t.I.d'],
                    ['response_type', 'code id_token token'],
                    ['scope', 's.c.o.p.e'],
                    ['username', 'p.a.s.s.w.o.r.d']
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

    expect(sut.handler.executionEngine.context.execution.data.getValue()).toEqual('T.O.K.E.N');
    expect(sut.handler.executionEngine.context.execution.header.getValue()).toEqual({
        decoded: '-- decoding not possible --',
        duration: '0.00',
        retries: 1,
        trace: {
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
        }
    });

    expect(fetchMock.mock.calls).toEqual([
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

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
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

    await expect(async () => await sut.handler.process(tableRows)).rejects.toThrowError(
        "key 'grantType:password' depends on 'clientId', but it does not exist!"
    );
});
