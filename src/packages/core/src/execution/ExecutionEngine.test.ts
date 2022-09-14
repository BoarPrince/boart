import 'jest-extended';

import { BaseRowType } from '../table/BaseRowType';
import { RowDefinition } from '../table/RowDefinition';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                _metaDefinition: new RowDefinition<TestExecutionContext, BaseRowType<TestExecutionContext>>({
                    key: null,
                    type: TableRowType.Configuration,
                    executionUnit: new ExecutionUnitMock(),
                    parameterType: null,
                    selectorType: null,
                    validators: null
                })
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
                _metaDefinition: new RowDefinition<TestExecutionContext, BaseRowType<TestExecutionContext>>({
                    key: null,
                    type: TableRowType.PreProcessing,
                    executionUnit: new ExecutionUnitMock(),
                    parameterType: null,
                    selectorType: null,
                    validators: null
                })
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
                _metaDefinition: new RowDefinition<TestExecutionContext, BaseRowType<TestExecutionContext>>({
                    key: null,
                    type: TableRowType.PostProcessing,
                    executionUnit: new ExecutionUnitMock(),
                    parameterType: null,
                    selectorType: null,
                    validators: null
                })
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
        const sut = new ExecutionEngine<TestExecutionContext, any>(() => mainExecutionUnit, contextGenerator);
        await sut.execute([rowDataPost, rowDataConfig, rowDataPre]);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(rowDataConfig.data._metaDefinition.executionUnit.execute) //
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method, @typescript-eslint/no-explicit-any
            .toHaveBeenCalledBefore(rowDataPre.data._metaDefinition.executionUnit.execute as any);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(rowDataPre.data._metaDefinition.executionUnit.execute) //
            .toHaveBeenCalledBefore(mainExecutionUnit.execute);

        expect(mainExecutionUnit.execute) //
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method, @typescript-eslint/no-explicit-any
            .toHaveBeenCalledBefore(rowDataPost.data._metaDefinition.executionUnit.execute as any);
    });
});
