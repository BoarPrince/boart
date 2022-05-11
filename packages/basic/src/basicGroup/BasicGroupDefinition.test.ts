import 'jest-extended';

import {
    ExecutionContext,
    MarkdownTableReader,
    ParaType,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import { DataExecutionContext, PropertySetterExecutionUnit, RowTypeValue } from '@boart/core-impl';
import BasicGroupDefinition from './BasicGroupDefinition';

/**
 *
 */
export type MockContext = ExecutionContext<
    {
        confValue: string;
    },
    {
        preValue: string;
    },
    DataExecutionContext
>;

/**
 *
 */
class MockTableHandler extends TableHandlerBaseImpl<MockContext, RowTypeValue<MockContext>> {
    private readonly key_body = Symbol('set-value');

    /**
     *
     */
    protected rowType = () => RowTypeValue;

    /**
     *
     */
    protected mainExecutionUnit = () => ({
        description: 'mock handler',
        execute: jest.fn()
    });

    /**
     *
     */
    protected newContext = () => ({
        config: {
            confValue: ''
        },
        preExecution: {
            preValue: ''
        },
        execution: {
            data: null,
            header: null
        }
    });

    /**
     *
     */
    protected addGroupRowDefinition(tableHandler: TableHandler<MockContext, RowTypeValue<MockContext>>) {
        tableHandler.addGroupRowDefinition(BasicGroupDefinition);
    }

    /**
     *
     */
    protected addRowDefinition(tableHandler: TableHandler<MockContext, RowTypeValue<MockContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: this.key_body,
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new PropertySetterExecutionUnit<MockContext, RowTypeValue<MockContext>>('preExecution', 'preValue'),
                validators: null
            })
        );
    }

    /**
     *
     */
    protected addGroupValidation(_tableHandler: TableHandler<MockContext, RowTypeValue<MockContext>>) {
        // no validation needed for test purposes
    }
}

/**
 *
 */
const sut = new MockTableHandler();

/**
 *
 */
it('wrong action key must throw an error', async () => {
    const tableDef = MarkdownTableReader.convert(
        `|action       |value       |
         |-------------|------------|        
         |wrong action |            |`
    );

    await expect(() => {
        sut.handler.process(tableDef);
    }).toThrowWithMessage(Error, "'undefined': key 'wrong action' is not valid");
});
