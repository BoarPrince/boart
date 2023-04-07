import { GroupRowDefinition, RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { IntValidator, RowTypeValue } from '@boart/core-impl';

import { DataExecutionUnit } from './DataExecutionUnit';
import { RepeatableDataExecutionContext } from './DataTableContext';

/**
 *
 */
export default class DataTableHandler extends TableHandlerBaseImpl<
    RepeatableDataExecutionContext,
    RowTypeValue<RepeatableDataExecutionContext>
> {
    /**
     *
     */
    rowType = () => RowTypeValue;

    /**
     *
     */
    mainExecutionUnit = () => new DataExecutionUnit();

    /**
     *
     */
    newContext = (): RepeatableDataExecutionContext => ({
        repetition: { pause: 0, count: 0 },
        config: null,
        preExecution: {
            payload: null
        },
        execution: {
            data: null,
            transformed: null,
            header: null
        }
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RepeatableDataExecutionContext, RowTypeValue<RepeatableDataExecutionContext>>): void {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<RepeatableDataExecutionContext, RowTypeValue<RepeatableDataExecutionContext>>): void {
        tableHandler.getRowDefinition('payload').key = Symbol('in');

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('repeat:wait'),
                type: TableRowType.Configuration,
                executionUnit: {
                    execute: (context: RepeatableDataExecutionContext, row: RowTypeValue<RepeatableDataExecutionContext>): void => {
                        context.repetition.pause = row.value as number;
                    }
                },
                validators: [new IntValidator('value')]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('repeat:wait:sec'),
                type: TableRowType.Configuration,
                executionUnit: {
                    execute: (context: RepeatableDataExecutionContext, row: RowTypeValue<RepeatableDataExecutionContext>): void => {
                        context.repetition.pause = (row.value as number) * 1000;
                    }
                },
                validators: [new IntValidator('value')]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('repeat:count'),
                type: TableRowType.Configuration,
                executionUnit: {
                    execute: (context: RepeatableDataExecutionContext, row: RowTypeValue<RepeatableDataExecutionContext>): void => {
                        context.repetition.count = row.value as number;
                    }
                },
                validators: [new IntValidator('value')]
            })
        );
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addGroupValidation(_: TableHandler<RepeatableDataExecutionContext, RowTypeValue<RepeatableDataExecutionContext>>) {
        // no group validation needed
    }
}
