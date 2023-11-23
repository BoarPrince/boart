import { Description } from '../description/Description';
import { Descriptionable } from '../description/Descriptionable';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionEngine } from '../execution/ExecutionEngine';
import { RepeatableExecutionContext } from '../execution/RepeatableExecutionContext';
import { LogProvider } from '../logging/LogProvider';
import { Runtime } from '../runtime/Runtime';
import { TypedGroupValidator } from '../validators/GroupValidator';
import { ValidationHandler } from '../validators/ValidationHandler';

import { BaseRowType } from './BaseRowType';
import { GroupRowDefinition } from './GroupRowDefinition';
import { RowDataBinder } from './RowDataBinder';
import { RowDefinition } from './RowDefinition';
import { RowDefinitionBinder } from './RowDefinitionBinder';
import { MetaInfo, TableMetaInfo } from './TableMetaInfo';
import { TableRows } from './TableRows';

/**
 *
 */
export class TableHandler<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> implements Descriptionable
{
    private readonly columnMetaInfo: MetaInfo;
    private readonly rowDefinitions = new Map<string, RowDefinition<TExecutionContext, TRowType>>();
    private readonly groupValidations = new Array<TypedGroupValidator<TExecutionContext, TRowType>>();
    private readonly logger = LogProvider.create('core').logger('tableHandler');
    private executionEngine: ExecutionEngine<TExecutionContext, TRowType>;

    /**
     *
     */
    constructor(
        private readonly rowType: new (BaseTableRowMetaDefinition) => TRowType,
        public readonly executionEngineCreator: () => ExecutionEngine<TExecutionContext, TRowType>
    ) {
        this.columnMetaInfo = TableMetaInfo.get(rowType);
    }

    /**
     * used only for test reasons
     */
    public getExecutionEngine(): ExecutionEngine<TExecutionContext, TRowType> {
        this.executionEngine = this.executionEngine ?? this.executionEngineCreator();
        return this.executionEngine;
    }

    /**
     *
     */
    public get description(): Description {
        const executionEngine = this.executionEngineCreator();
        return executionEngine.mainExecutionUnit().description;
    }

    /**
     *
     */
    addRowDefinition(definition: RowDefinition<TExecutionContext, TRowType>): this {
        this.rowDefinitions.set(definition.key.description, definition.clone());
        return this;
    }

    /**
     *
     */
    removeRowDefinition(key: string): this {
        if (!this.rowDefinitions.has(key)) {
            throw Error(`key: '{key}' cannot removed, because it does not exists`);
        }
        this.rowDefinitions.delete(key);
        return this;
    }

    /**
     *
     */
    removeAllRowDefinitions(): this {
        this.rowDefinitions.clear();
        return this;
    }

    /**
     *
     */
    getRowDefinition(key: string): RowDefinition<TExecutionContext, TRowType> {
        if (!this.rowDefinitions.has(key)) {
            throw Error(`key: '{key}' cannot retrieved, because it does not exists`);
        }

        return this.rowDefinitions.get(key);
    }

    /**
     *
     */
    getRowDefinitions(): Array<RowDefinition<TExecutionContext, TRowType>> {
        return Array.from(this.rowDefinitions.values());
    }

    /**
     *
     */
    addGroupValidator(groupValidator: TypedGroupValidator<TExecutionContext, TRowType>): this {
        this.groupValidations.push(groupValidator);
        return this;
    }

    /**
     *
     */
    addGroupRowDefinition(groupRowDefinition: GroupRowDefinition<TExecutionContext, TRowType>): this {
        groupRowDefinition.definitions.subscribe((rowDefinition) => this.addRowDefinition(rowDefinition));
        groupRowDefinition.validations.subscribe((groupValidator) => this.addGroupValidator(groupValidator));
        return this;
    }

    /**
     *
     */
    async process(tableDefinition: TableRows): Promise<TExecutionContext>;
    async process(tableDefinition: string): Promise<TExecutionContext>;
    async process(tableDefinition: TableRows | string): Promise<TExecutionContext> {
        this.logger.info(() => 'process');

        const executionEngine = this.executionEngineCreator();
        try {
            return await this.processInternal(executionEngine, tableDefinition);
        } catch (error) {
            const context = executionEngine.context;
            const repetition = (context as unknown as RepeatableExecutionContext<object, object, object>).repetition;
            if (!repetition || repetition?.count == 0) {
                throw error;
            } else {
                return this.processRepeatable(executionEngine, tableDefinition, repetition.count, repetition.pause);
            }
        }
    }

    /**
     *
     */
    private async processRepeatable(
        executionEngine: ExecutionEngine<TExecutionContext, TRowType>,
        tableDefinition: TableRows | string,
        count: number,
        pause: number
    ): Promise<TExecutionContext> {
        let context: TExecutionContext;
        let error: Error;

        for (let index = 0; index < count; index++) {
            error = null;
            await new Promise((resolve) => setTimeout(() => resolve(null), pause));
            Runtime.instance.stepRuntime.notifyClear();
            Runtime.instance.stepRuntime.current.reputations++;

            try {
                context = await this.processInternal(executionEngine, tableDefinition);
                return context;
            } catch (err) {
                error = err;
            }
        }

        if (!!error) {
            throw error;
        } else {
            return context;
        }
    }

    /**
     *
     */
    private processInternal(
        executionEngine: ExecutionEngine<TExecutionContext, TRowType>,
        tableDefinition: TableRows | string
    ): Promise<TExecutionContext> {
        const dataBinder = new RowDataBinder(this.columnMetaInfo.tableName, this.columnMetaInfo, tableDefinition);
        dataBinder.check();
        const valueRows = dataBinder.bind();

        const definitionBinder = new RowDefinitionBinder<TExecutionContext, TRowType>(
            this.columnMetaInfo.tableName,
            this.columnMetaInfo,
            Array.from(this.rowDefinitions.values()),
            valueRows
        );
        const rows = definitionBinder.bind(this.rowType);

        this.executionEngine = executionEngine;
        this.logger.info(() => `process internal ### ${executionEngine.mainExecutionUnit().description.id} ###`, null, true);

        const validator = new ValidationHandler<TExecutionContext, TRowType>(this.groupValidations);
        validator.preValidate(rows);

        return executionEngine
            .preExecute(rows)
            .then((canProceed) => {
                if (canProceed) {
                    validator.validate(rows);
                    return executionEngine.execute(rows);
                } else {
                    return executionEngine.context;
                }
            })
            .catch((errorReason) => {
                throw errorReason;
            });
    }
}
