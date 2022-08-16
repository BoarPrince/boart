import 'jest-extended';

import { BaseRowType } from '../table/BaseRowType';
import { TableRowType } from '../table/TableRowType';

import { ExecutionContext } from './ExecutionContext';
import { ExecutionEngine } from './ExecutionEngine';
import { ExecutionUnit } from './ExecutionUnit';

/**
 *
 */
interface TestConfig {
    config_name: string;
}

/**
 *
 */
interface TestContextPreExecution {
    pre_name: string;
}

/**
 *
 */
interface TestContextExecution {
    data: string;
}

/**
 *
 */
class TestExecutionContext implements ExecutionContext<TestConfig, TestContextPreExecution, TestContextExecution> {
    config: TestConfig;
    preExecution: TestContextPreExecution;
    execution: TestContextExecution;
}

/**
 *
 */
class ExecutionUnitMock implements ExecutionUnit<TestExecutionContext, any> {
    /**
     *
     */
    description = 'mock';
    /**
     *
     */
    execute = jest.fn();
}

/**
 *
 */
describe('check execution engine', () => {
    /**
     *
     */
    it('check call order', async () => {
        const rowDataConfig: BaseRowType<TestExecutionContext> = {
            data: {
                key: 'a:a',
                keyPara: null,
                selector: null,
                values: {
                    value1: null
                },
                values_replaced: {
                    value1: null
                },
                _metaDefinition: {
                    key: null,
                    type: TableRowType.Configuration,
                    executionUnit: new ExecutionUnitMock(),
                    parameterType: null,
                    selectorType: null,
                    validators: null
                }
            }
        };

        const rowDataPre: BaseRowType<TestExecutionContext> = {
            data: {
                key: 'a:a',
                keyPara: null,
                selector: null,
                values: {
                    value1: null
                },
                values_replaced: {
                    value1: null
                },
                _metaDefinition: {
                    key: null,
                    type: TableRowType.PreProcessing,
                    executionUnit: new ExecutionUnitMock(),
                    parameterType: null,
                    selectorType: null,
                    validators: null
                }
            }
        };

        const rowDataPost: BaseRowType<TestExecutionContext> = {
            data: {
                key: 'a:a',
                keyPara: null,
                selector: null,
                values: {
                    value1: null
                },
                values_replaced: {
                    value1: null
                },
                _metaDefinition: {
                    key: null,
                    type: TableRowType.PostProcessing,
                    executionUnit: new ExecutionUnitMock(),
                    parameterType: null,
                    selectorType: null,
                    validators: null
                }
            }
        };

        const contextGenerator = (): TestExecutionContext => {
            return {
                config: {
                    config_name: ''
                },
                preExecution: {
                    pre_name: ''
                },
                execution: {
                    data: ''
                }
            };
        };

        const mainExecutionUnit = new ExecutionUnitMock();
        const sut = new ExecutionEngine<TestExecutionContext, any>(mainExecutionUnit, contextGenerator);
        await sut.execute([rowDataPost, rowDataConfig, rowDataPre]);

        expect(await rowDataConfig.data._metaDefinition.executionUnit.execute) //
            .toHaveBeenCalledBefore(rowDataPre.data._metaDefinition.executionUnit.execute as any);

        expect(await rowDataPre.data._metaDefinition.executionUnit.execute) //
            .toHaveBeenCalledBefore(mainExecutionUnit.execute);

        expect(await mainExecutionUnit.execute) //
            .toHaveBeenCalledBefore(rowDataPost.data._metaDefinition.executionUnit.execute as any);
    });
});
