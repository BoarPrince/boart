import 'jest-extended';
import { Runtime } from '../runtime/Runtime';
import { StepContext } from '../runtime/RuntimeContext';
import { RuntimeStatus } from '../runtime/RuntimeStatus';

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
    data: Array<string>;
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
    execute = jest.fn().mockImplementation((context: TestExecutionContext, row: BaseRowType<TestExecutionContext>) => {
        context.execution.data.push(row?.data.key || 'main');
    });
}

/**
 *
 */
const createBaseRowType = (name: string, type: TableRowType, priority = 0): BaseRowType<TestExecutionContext> => ({
    data: {
        key: name,
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
            priority,
            type,
            executionUnit: new ExecutionUnitMock(),
            parameterType: null,
            selectorType: null,
            validators: null
        })
    }
});

/**
 *
 */
const contextGenerator = (): TestExecutionContext => {
    return {
        config: {
            config_name: ''
        },
        preExecution: {
            pre_name: ''
        },
        execution: {
            data: []
        }
    };
};

/**
 *
 */
it('check call order - pre, post, ...', async () => {
    const rowDataPreConfig = createBaseRowType('pre config', TableRowType.PreConfiguration);
    const rowDataConfig = createBaseRowType('config', TableRowType.Configuration);
    const rowDataPre = createBaseRowType('pre', TableRowType.PreProcessing);
    const rowDataPost = createBaseRowType('post', TableRowType.PostProcessing);

    const mainExecutionUnit = new ExecutionUnitMock();
    const sut = new ExecutionEngine<TestExecutionContext, any>(() => mainExecutionUnit, contextGenerator);
    const context = await sut.execute([rowDataPost, rowDataConfig, rowDataPreConfig, rowDataPre]);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(rowDataPreConfig.data._metaDefinition.executionUnit.execute) //
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method, @typescript-eslint/no-explicit-any
        .toHaveBeenCalledBefore(rowDataConfig.data._metaDefinition.executionUnit.execute as any);

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

    expect(context.execution.data.join(',')).toEqual('pre config,config,pre,main,post');
});

/**
 *
 */
it('check call order - pre, post, ...', async () => {
    const rowDataPreConfig = createBaseRowType('pre config', TableRowType.PreConfiguration);
    const rowDataConfig = createBaseRowType('config', TableRowType.Configuration);
    const rowDataPre = createBaseRowType('pre', TableRowType.PreProcessing);
    const rowDataPost = createBaseRowType('post', TableRowType.PostProcessing);

    Runtime.instance.stepRuntime.current = { ...new StepContext(), status: RuntimeStatus.stopped };

    const mainExecutionUnit = new ExecutionUnitMock();
    const sut = new ExecutionEngine<TestExecutionContext, any>(() => mainExecutionUnit, contextGenerator);

    const context = await sut.execute([rowDataPost, rowDataConfig, rowDataPreConfig, rowDataPre]);

    expect(context.execution.data.join(',')).toEqual('pre config');
});
