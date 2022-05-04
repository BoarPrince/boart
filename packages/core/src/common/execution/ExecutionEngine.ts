import { BaseRowType } from '../table/BaseRowType';
import { TableRowType } from '../table/TableRowType';

import { AsyncExecutionUnit } from './AsyncExecutionUnit';
import { ExecutionContext } from './ExecutionContext';

/**
 *
 */
export class ExecutionEngine<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    public readonly context: TExecutionContext;
    /**
     *
     */
    constructor(
        private readonly mainExecutionUnit: AsyncExecutionUnit<TExecutionContext, TRowType>,
        private readonly executionContextGenerator: () => TExecutionContext
    ) {
        this.context = this.executionContextGenerator();
    }

    /**
     *
     */
    async execute(rows: ReadonlyArray<TRowType>): Promise<void> {
        this.executeByType(rows, this.context, TableRowType.Configuration);
        this.executeByType(rows, this.context, TableRowType.PreProcessing);

        await this.mainExecutionUnit.execute(this.context, null);

        this.executeByType(rows, this.context, TableRowType.PostProcessing);
    }

    /**
     *
     */
    private executeByType(rows: ReadonlyArray<TRowType>, context: TExecutionContext, type: TableRowType): void {
        rows.filter(row => row.data._metaDefinition.type === type) //
            .forEach(row => row.data._metaDefinition.executionUnit.execute(context, row));
    }
}
