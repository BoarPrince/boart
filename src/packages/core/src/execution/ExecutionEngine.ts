import { BaseRowType } from '../table/BaseRowType';
import { TableRowType } from '../table/TableRowType';

import { ExecutionContext } from './ExecutionContext';
import { ExecutionUnit } from './ExecutionUnit';
import { ExecutionUnitValidation } from './ExecutionUnitValidation';

/**
 *
 */
export class ExecutionEngine<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    public context: TExecutionContext;

    /**
     *
     */
    constructor(
        private readonly mainExecutionUnit: () => ExecutionUnit<TExecutionContext, TRowType>,
        private readonly executionContextGenerator: () => TExecutionContext
    ) {
        this.initContext();
    }

    /**
     *
     */
    public initContext(): void {
        this.context = this.executionContextGenerator();
    }

    /**
     *
     */
    async execute(rows: ReadonlyArray<TRowType>): Promise<TExecutionContext> {
        await this.executeByType(rows, this.context, TableRowType.Configuration);
        await this.executeByType(rows, this.context, TableRowType.PreProcessing);

        const mainExecutionUnit = this.mainExecutionUnit();

        const mainExecutionUnitWithValidator = mainExecutionUnit as ExecutionUnitValidation<TExecutionContext> &
            ExecutionUnit<TExecutionContext, TRowType>;

        if (mainExecutionUnitWithValidator.validate) {
            await mainExecutionUnitWithValidator.validate(this.context);
        }

        await mainExecutionUnit.execute(this.context, null, () => this.executeByType(rows, this.context, TableRowType.InProcessing));

        await this.executeByType(rows, this.context, TableRowType.PostProcessing);

        return this.context;
    }

    /**
     *
     */
    private async executeByType(rows: ReadonlyArray<TRowType>, context: TExecutionContext, type: TableRowType): Promise<void> {
        const rowsByType = rows.filter((row) => row.data._metaDefinition.type === type);
        for (const row of rowsByType) {
            await row.data._metaDefinition.executionUnit.execute(context, row);
        }
    }
}
