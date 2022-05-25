import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionUnit } from '../execution/ExecutionUnit';

import { BaseRowType } from './BaseRowType';
import { GroupRowDefinition } from './GroupRowDefinition';
import { GroupRowDefinitionInitializer } from './GroupRowDefinitionInitializer';
import { key, value } from './TableRowDecorator';
import { TableRowType } from './TableRowType';

/**
 *
 */
export class RowTypeValue<TExecutionContext extends ExecutionContext<object, object, object>> extends BaseRowType<TExecutionContext> {
    @key()
    get action() {
        return this.data.key;
    }
    get actionPara() {
        return this.data.keyPara;
    }

    @value()
    get value() {
        return this.data.values_replaced['value'];
    }
}

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
    it('check initialization', (done) => {
        /**
         *
         */
        @GroupRowDefinitionInitializer('group-xxx', TableRowType.PostProcessing)
        class ExecutionUnitMock implements ExecutionUnit<TestExecutionContext1, RowTypeValue<TestExecutionContext1>> {
            description = 'mock-xxx';
            execute = jest.fn();
        }

        const derived_sut = GroupRowDefinition.getInstance('group-xxx');
        void derived_sut.definitions.forEach((definition) => {
            expect(definition.key.description).toBe('mock-xxx');
            done();
        });
    });
});
