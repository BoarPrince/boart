import { DefaultRowType, GroupRowDefinition, ParaType, RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { IntValidator, QualifierValidator } from '@boart/core-impl';

import { DataExecutionUnit } from './DataExecutionUnit';
import { RepeatableDataExecutionContext } from './DataTableContext';

/**
 *
 */
export default class DataTableHandler extends TableHandlerBaseImpl<
    RepeatableDataExecutionContext,
    DefaultRowType<RepeatableDataExecutionContext>
> {
    /**
     *
     */
    rowType = () => DefaultRowType;

    /**
     *
     */
    mainExecutionUnit = () => new DataExecutionUnit();

    /**
     *
     */
    newContext = (): RepeatableDataExecutionContext => ({
        repetition: { pause: 0, count: 0 },
        config: {},
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
    addGroupRowDefinition(
        tableHandler: TableHandler<RepeatableDataExecutionContext, DefaultRowType<RepeatableDataExecutionContext>>
    ): void {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<RepeatableDataExecutionContext, DefaultRowType<RepeatableDataExecutionContext>>): void {
        // tableHandler.getRowDefinition('payload').forEach((def) => (def.key = Symbol('in')));

        tableHandler.addRowDefinition(
            new RowDefinition({
                parameterType: ParaType.Optional,
                type: TableRowType.Configuration,
                executionUnit: {
                    key: Symbol('repeat:wait'),
                    execute: (context: RepeatableDataExecutionContext, row: DefaultRowType<RepeatableDataExecutionContext>): void => {
                        if (row.ast.qualifier.stringValue === 'wait:sec') {
                            context.repetition.pause = (row.value as number) * 1000;
                        } else {
                            context.repetition.pause = row.value as number;
                        }
                    }
                },
                validators: [
                    new IntValidator('value'),
                    new QualifierValidator([
                        { qualifier: null, paras: null },
                        { qualifier: 'wait', paras: ['', 'sec'] }
                    ])
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.Configuration,
                executionUnit: {
                    key: Symbol('repeat:count'),
                    execute: (context: RepeatableDataExecutionContext, row: DefaultRowType<RepeatableDataExecutionContext>): void => {
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
    addGroupValidation(_: TableHandler<RepeatableDataExecutionContext, DefaultRowType<RepeatableDataExecutionContext>>) {
        // no group validation needed
    }
}
