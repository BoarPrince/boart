import { AsyncExecutionUnit } from '../execution/AsyncExecutionUnit';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionEngine } from '../execution/ExecutionEngine';

import { BaseRowType } from './BaseRowType';
import { TableHandler } from './TableHandler';

/**
 *
 */
export default abstract class TableHandlerBaseImpl<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    private tableHandler: TableHandler<TExecutionContext, TRowType>;

    /**
     *
     */
    get handler(): TableHandler<TExecutionContext, TRowType> {
        if (!this.tableHandler) {
            this.tableHandler = new TableHandler<TExecutionContext, TRowType>(
                this.rowType(),
                new ExecutionEngine<TExecutionContext, TRowType>(this.mainExecutionUnit(), () => this.newContext())
            );
            this.init(this.tableHandler);
        }
        return this.tableHandler;
    }

    /**
     *
     */
    private init(tableHandler: TableHandler<TExecutionContext, TRowType>) {
        this.addGroupRowDefinition(tableHandler);
        this.addRowDefinition(tableHandler);
        this.addGroupValidation(tableHandler);
    }

    /**
     *
     */
    abstract rowType(): new (metaDef) => TRowType;

    /**
     *
     */
    abstract mainExecutionUnit(): AsyncExecutionUnit<TExecutionContext, TRowType>;

    /**
     *
     */
    abstract newContext(): TExecutionContext;

    /**
     *
     */
    abstract addGroupRowDefinition(tableHandler: TableHandler<TExecutionContext, TRowType>);
    abstract addRowDefinition(tableHandler: TableHandler<TExecutionContext, TRowType>);
    abstract addGroupValidation(tableHandler: TableHandler<TExecutionContext, TRowType>);
}
