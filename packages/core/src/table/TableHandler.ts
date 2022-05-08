import { TypedGroupValidator } from '../Validators/GroupValidator';
import { ValidationHandler } from '../Validators/ValidationHandler';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionEngine } from '../execution/ExecutionEngine';

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
> {
    private readonly columnMetaInfo: MetaInfo;

    private readonly rowDefinitions = new Array<RowDefinition<TExecutionContext, TRowType>>();
    private readonly groupValidations = new Array<TypedGroupValidator<TExecutionContext, TRowType>>();

    /**
     *
     */
    constructor(
        private readonly rowType: new (BaseTableRowMetaDefinition) => TRowType,
        public readonly executionEngine: ExecutionEngine<TExecutionContext, TRowType>
    ) {
        this.columnMetaInfo = TableMetaInfo.get(rowType);
    }

    /**
     *
     */
    addRowDefinition(definition: RowDefinition<TExecutionContext, TRowType>): this {
        this.rowDefinitions.push(definition);
        return this;
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
    process(tableDefinition: TableRows): Promise<void>;
    process(tableDefinition: string): Promise<void>;
    process(tableDefinition: TableRows | string): Promise<void> {
        const dataBinder = new RowDataBinder(this.columnMetaInfo.tableName, this.columnMetaInfo, tableDefinition);
        dataBinder.check();
        const valueRows = dataBinder.bind();

        const definitionBinder = new RowDefinitionBinder<TExecutionContext, TRowType>(
            this.columnMetaInfo.tableName,
            this.columnMetaInfo,
            this.rowDefinitions,
            valueRows
        );
        const rows = definitionBinder.bind(this.rowType);

        const validator = new ValidationHandler<TExecutionContext, TRowType>(this.groupValidations);
        validator.validate(rows);

        return this.executionEngine.execute(rows);
    }
}
