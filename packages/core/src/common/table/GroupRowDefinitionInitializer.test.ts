import { RowTypeValue } from '../../implementation/RowTypeValue';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { GroupRowDefinition } from './GroupRowDefinition';
import { GroupRowDefinitionInitializer } from './GroupRowDefinitionInitializer';
import { TableRowType } from './TableRowType';

/**
 *
 */
class TestExecutionContext1 implements ExecutionContext<any, any, any> {
    config: {
        a: string;
    };
    preExecution: object;
    execution: object;
}

/**
 *
 */
class TestExecutionContext2 implements ExecutionContext<any, any, any> {
    config: {
        b: string;
    };
    preExecution: object;
    execution: object;
}

/**
 *
 */
describe('check GroupRowDefinition Initializer', () => {
    /**
     *
     */
    it('check initialization', done => {
        /**
         *
         */
        @GroupRowDefinitionInitializer('group-xxx', TableRowType.PostProcessing)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class ExecutionUnitMock implements ExecutionUnit<TestExecutionContext1, RowTypeValue<TestExecutionContext1>> {
            description = 'mock-xxx';
            execute = jest.fn();
        }

        const derived_sut = GroupRowDefinition.getInstance('group-xxx');
        void derived_sut.definitions.forEach(definition => {
            expect(definition.key.description).toBe('mock-xxx');
            done();
        });
    });
});
