import { LocalContext, Runtime, RuntimeContext, StepContext, TestContext } from '@boart/core';

import { TestReportItem } from '../report-item/TestReportItem';

import { TestReport } from './TestReport';

/**
 *
 */
let writeFileCall = {
    file: '',
    data: {} as TestReportItem,
    flag: ''
};

/**
 *
 */
let sut: TestReport;

/**
 *
 */
jest.mock('fs', () => {
    return {
        readFileSync: (): string => '{}',
        writeFile(file: string, data: string, flag: string): void {
            writeFileCall = {
                file,
                data: JSON.parse(data) as TestReportItem,
                flag
            };
        }
    };
});

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
        }
    };
});

/**
 *
 */
beforeEach(() => {
    Runtime.instance.runtime.notifyStart({} as RuntimeContext);
    Runtime.instance.localRuntime.notifyStart({} as LocalContext);
    Runtime.instance.testRuntime.notifyStart({} as TestContext);
    Runtime.instance.stepRuntime.notifyStart({} as StepContext);

    process.env.environment_reports_data_dir = '<report-path>';
});

/**
 *
 */
beforeEach(() => {
    globalThis._testReportInstance = null;
    sut = TestReport.instance;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Runtime.instance.testRuntime.current = {
        id: '-id-'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    writeFileCall = {} as any;
});

it.each([
    [1, '1.12. Read XXX', '/parth1/path2/boart/specs/5. Company.spec', 'Read XXX', '5.12'],
    [2, '1.12. Read XXX', '/parth1/path2/boart/specs/15. Company.spec', 'Read XXX', '15.12'],
    [3, '1.12 Read XXX', '/parth1/path2/boart/specs/15. Company.spec', 'Read XXX', '15.12'],
    [4, '1.1 Read XXX', '/parth1/path2/boart/specs/15 Company.spec', 'Read XXX', '15.1']
])(`md-number: %s, number: %s, md-name: %s, name: %s `, (_: number, md_name: string, md_location: string, name: string, number: string) => {
    Runtime.instance.testRuntime.notifyStart({
        id: '-id-',
        name: md_name,
        location: md_location
    } as TestContext);

    sut.report();

    expect(writeFileCall.data.number).toBe(number);
    expect(writeFileCall.data.name).toBe(name);
});
