import 'jest-extended';
import { Runtime } from '../runtime/Runtime';
import { RuntimeStatus } from '../runtime/RuntimeStatus';
import { StepContext } from '../runtime/StepContext';
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
    description = {
        id: '28c5f0a1-593f-4688-8dd4-81e189485902',
        title: 'mock',
        description: '',
        examples: null
    };

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
        ast: null,
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
describe('default', () => {
    /**
     *
     */
    beforeEach(() => {
        Runtime.instance.stepRuntime.current = new StepContext();
    });

    /**
     *
     */
    it('call order - pre, post, ...', async () => {
        const rowDataConfig = createBaseRowType('config', TableRowType.Configuration);
        const rowDataPre = createBaseRowType('pre', TableRowType.PreProcessing);
        const rowDataPost = createBaseRowType('post', TableRowType.PostProcessing);

        const mainExecutionUnit = new ExecutionUnitMock();
        const sut = new ExecutionEngine<TestExecutionContext, any>(() => mainExecutionUnit, contextGenerator);
        const context = await sut.execute([rowDataPost, rowDataConfig, rowDataPre]);

        expect(rowDataConfig.data._metaDefinition.executionUnit.execute) //
            // eslint-disable-next-line jest/unbound-method
            .toHaveBeenCalledBefore(rowDataPre.data._metaDefinition.executionUnit.execute as never);

        expect(rowDataPre.data._metaDefinition.executionUnit.execute) //
            .toHaveBeenCalledBefore(mainExecutionUnit.execute);

        expect(mainExecutionUnit.execute) //
            // eslint-disable-next-line jest/unbound-method
            .toHaveBeenCalledBefore(rowDataPost.data._metaDefinition.executionUnit.execute as never);

        expect(context.execution.data.join(',')).toBe('config,pre,main,post');
    });

    /**
     *
     */
    it('runtimeStatus:stopped halt the execution', async () => {
        const rowDataPreConfig = createBaseRowType('pre config', TableRowType.PreConfiguration);
        const rowDataConfig = createBaseRowType('config', TableRowType.Configuration);
        const rowDataPre = createBaseRowType('pre', TableRowType.PreProcessing);
        const rowDataPost = createBaseRowType('post', TableRowType.PostProcessing);

        const mainExecutionUnit = new ExecutionUnitMock();
        const sut = new ExecutionEngine<TestExecutionContext, BaseRowType<TestExecutionContext>>(() => mainExecutionUnit, contextGenerator);

        Runtime.instance.stepRuntime.current.status = RuntimeStatus.stopped;
        const canProceed = await sut.preExecute([rowDataPost, rowDataConfig, rowDataPreConfig, rowDataPre]);

        expect(canProceed).toBe(false);
    });

    /**
     *
     */
    it('runtimeStatus:not-stopped proceed the execution', async () => {
        const rowDataPreConfig = createBaseRowType('pre config', TableRowType.PreConfiguration);
        const rowDataConfig = createBaseRowType('config', TableRowType.Configuration);
        const rowDataPre = createBaseRowType('pre', TableRowType.PreProcessing);
        const rowDataPost = createBaseRowType('post', TableRowType.PostProcessing);

        const mainExecutionUnit = new ExecutionUnitMock();
        const sut = new ExecutionEngine<TestExecutionContext, BaseRowType<TestExecutionContext>>(() => mainExecutionUnit, contextGenerator);

        Runtime.instance.stepRuntime.current.status = RuntimeStatus.succeed;
        const canProceed = await sut.preExecute([rowDataPost, rowDataConfig, rowDataPreConfig, rowDataPre]);

        expect(canProceed).toBe(true);
    });

    /**
     *
     */
    it('each type can have his own order', async () => {
        const rowDataConfig = createBaseRowType('config', TableRowType.Configuration);
        const rowDataPre1 = createBaseRowType('pre1', TableRowType.PreProcessing, 1);
        const rowDataPre2 = createBaseRowType('pre2', TableRowType.PreProcessing, 2);
        const rowDataPre3 = createBaseRowType('pre3', TableRowType.PreProcessing, 3);
        const rowDataPost = createBaseRowType('post', TableRowType.PostProcessing);

        const mainExecutionUnit = new ExecutionUnitMock();
        const sut = new ExecutionEngine<TestExecutionContext, BaseRowType<TestExecutionContext>>(() => mainExecutionUnit, contextGenerator);

        const context = await sut.execute([rowDataPost, rowDataConfig, rowDataPre2, rowDataPre1, rowDataPre3]);

        expect(context.execution.data.join(',')).toBe('config,pre3,pre2,pre1,main,post');
    });
});
