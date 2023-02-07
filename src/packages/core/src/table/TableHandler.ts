import { Description } from '../description/Description';
import { Descriptionable } from '../description/Descriptionable';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionEngine } from '../execution/ExecutionEngine';
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

    // only public, because of use in tests
    public executionEngine: ExecutionEngine<TExecutionContext, TRowType>;

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
     *
     */
    public get description(): Description | (() => Description) {
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
    process(tableDefinition: TableRows): Promise<TExecutionContext>;
    process(tableDefinition: string): Promise<TExecutionContext>;
    process(tableDefinition: TableRows | string): Promise<TExecutionContext> {
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

        this.executionEngine = this.executionEngineCreator();

        const validator = new ValidationHandler<TExecutionContext, TRowType>(this.groupValidations);
        validator.preValidate(rows);

        return this.executionEngine
            .preExecute(rows)
            .then((canProceed) => {
                if (canProceed) {
                    validator.validate(rows);
                    return this.executionEngine.execute(rows);
                } else {
                    return this.executionEngine.context;
                }
            })
            .catch((errorReason) => {
                throw errorReason;
            });
    }
}
