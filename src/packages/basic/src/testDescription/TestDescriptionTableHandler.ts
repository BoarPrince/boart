import { RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { PropertySetterExecutionUnit, RequiredValidator, RowTypeValue, UniqueValidator, ValueValidator } from '@boart/core-impl';

import { TestDescriptionContext } from './TestDescriptionContext';
import { TestDescriptionExecutionUnit } from './TestDescriptionExecutionUnit';

/**
 *
 */
export default class TestDescriptionTableHandler extends TableHandlerBaseImpl<
    TestDescriptionContext,
    RowTypeValue<TestDescriptionContext>
> {
    /**
     *
     */
    rowType = () => RowTypeValue;

    /**
     *
     */
    mainExecutionUnit = () => new TestDescriptionExecutionUnit();

    /**
     *
     */
    newContext = (): TestDescriptionContext => ({
        config: {
            ticket: '',
            description: '',
            failureDescription: '',
            priority: ''
        },
        preExecution: null,
        execution: null
    });

    /**
     *
     */
    addGroupRowDefinition() {
        // no group definition needed
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<TestDescriptionContext, RowTypeValue<TestDescriptionContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('priority'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<TestDescriptionContext, RowTypeValue<TestDescriptionContext>>(
                    'config',
                    'priority'
                ),
                validators: [new UniqueValidator(), new ValueValidator('value', ['low', 'medium', 'high'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('description'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<TestDescriptionContext, RowTypeValue<TestDescriptionContext>>(
                    'config',
                    'description',
                    {
                        concat: true
                    }
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('failureDescription'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<TestDescriptionContext, RowTypeValue<TestDescriptionContext>>(
                    'config',
                    'failureDescription',
                    {
                        concat: true
                    }
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('ticket'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<TestDescriptionContext, RowTypeValue<TestDescriptionContext>>(
                    'config',
                    'ticket',
                    {
                        concat: true,
                        delimiter: ',',
                        defaultModifier: (value: string) => value?.replace(/\n/g, ',')
                    }
                ),
                validators: null
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<TestDescriptionContext, RowTypeValue<TestDescriptionContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('description'), Symbol('priority')]));
    }
}
