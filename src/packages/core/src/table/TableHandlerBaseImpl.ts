import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionEngine } from '../execution/ExecutionEngine';
import { ExecutionUnit } from '../execution/ExecutionUnit';

import { BaseRowType } from './BaseRowType';
import { TableHandler } from './TableHandler';

/**
 *
 */
export abstract class TableHandlerBaseImpl<
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
                new ExecutionEngine<TExecutionContext, TRowType>(
                    () => this.mainExecutionUnit(),
                    () => this.newContext()
                )
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
    protected abstract rowType(): new (metaDef) => TRowType;

    /**
     *
     */
    protected abstract mainExecutionUnit(): ExecutionUnit<TExecutionContext, TRowType>;

    /**
     *
     */
    protected abstract newContext(): TExecutionContext;

    /**
     *
     */
    protected abstract addGroupRowDefinition(tableHandler: TableHandler<TExecutionContext, TRowType>);
    protected abstract addRowDefinition(tableHandler: TableHandler<TExecutionContext, TRowType>);
    protected abstract addGroupValidation(tableHandler: TableHandler<TExecutionContext, TRowType>);
}
