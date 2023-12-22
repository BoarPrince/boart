import { LogProvider } from '../logging/LogProvider';
import { Runtime } from '../runtime/Runtime';
import { RuntimeStatus } from '../runtime/RuntimeStatus';
import { Context } from '../store/Context';
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
    private readonly logger = LogProvider.create('core').logger('executionEngine');
    public context: TExecutionContext;

    /**
     *
     */
    constructor(
        public readonly mainExecutionUnit: () => ExecutionUnit<TExecutionContext, TRowType>,
        private readonly executionContextGenerator: () => TExecutionContext
    ) {
        this.initContext();
    }

    /**
     *
     */
    private initContext(): void {
        this.context = this.executionContextGenerator();
    }

    /**
     *
     */
    public async preExecute(rows: ReadonlyArray<TRowType>): Promise<boolean> {
        this.logger.info(() => 'preExecute');
        await this.executeByType(rows, TableRowType.PreConfiguration);
        return Runtime.instance.stepRuntime.currentContext?.status !== RuntimeStatus.stopped;
    }

    /**
     *
     */
    public async execute(rows: ReadonlyArray<TRowType>): Promise<TExecutionContext> {
        this.logger.info(() => 'execute');
        Context.instance.setContext(this.context.config);
        await this.executeByType(rows, TableRowType.Configuration);

        Context.instance.setContext(this.context.preExecution);
        await this.executeByType(rows, TableRowType.PreProcessing);

        try {
            await this.executeMainUnit(rows);
        } finally {
            Context.instance.setContext(this.context.execution);
            await this.executeByType(rows, TableRowType.PostProcessingForced, false);
        }

        await this.executeByType(rows, TableRowType.PostProcessing);

        return this.context;
    }

    /**
     *
     */
    private async executeMainUnit(rows: ReadonlyArray<TRowType>): Promise<void> {
        this.logger.info(() => 'executeMainUnit');
        const mainExecutionUnit = this.mainExecutionUnit();

        const mainExecutionUnitWithValidator = mainExecutionUnit as ExecutionUnitValidation<TExecutionContext> &
            ExecutionUnit<TExecutionContext, TRowType>;

        if (mainExecutionUnitWithValidator.validate) {
            await mainExecutionUnitWithValidator.validate(this.context);
        }

        await mainExecutionUnit.execute(this.context, null, () => this.executeByType(rows, TableRowType.InProcessing));
    }

    /**
     *
     */
    private async executeByType(rows: ReadonlyArray<TRowType>, type: TableRowType, throwErrors = true): Promise<void> {
        const rowsByType = rows //
            .filter((row) => row.data._metaDefinition.type === type)
            .sort((row1, row2) => row2.data._metaDefinition.priority - row1.data._metaDefinition.priority);

        const executer = throwErrors
            ? (row: TRowType) => {
                  this.logger.debug(
                      () => `execute 'type: ${TableRowType[type]}', key: ${row.data.ast.match}`,
                      () => row.data.values_replaced
                  );
                  return row.data._metaDefinition.executionUnit.execute(this.context, row);
              }
            : (row: TRowType) => {
                  try {
                      this.logger.debug(() => `execute, ignore exception 'type: ${TableRowType[type]}', key: ${row.data.ast.match}`);
                      return row.data._metaDefinition.executionUnit.execute(this.context, row);
                  } catch (error) {
                      /* do not throw any errors */
                  }
              };

        for (const row of rowsByType) {
            await executer(row);
        }
    }
}
