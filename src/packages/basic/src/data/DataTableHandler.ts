import { GroupRowDefinition, TableHandler, TableHandlerBaseImpl } from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';

import { DataExecutionUnit } from './DataExecutionUnit';

/**
 *
 */
export default class DataTableHandler extends TableHandlerBaseImpl<DataContext, RowTypeValue<DataContext>> {
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
    newContext = (): DataContext => ({
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
    addGroupRowDefinition(tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>) {
        tableHandler.getRowDefinition('payload').key = Symbol('in');
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addGroupValidation(_: TableHandler<DataContext, RowTypeValue<DataContext>>) {
        // no group validation needed
    }
}
