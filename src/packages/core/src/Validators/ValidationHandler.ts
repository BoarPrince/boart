import { ExecutionContext } from '../execution/ExecutionContext';
import { AnyBaseRowType, BaseRowType } from '../table/BaseRowType';
import { TableRowType } from '../table/TableRowType';

import { TypedGroupValidator } from './GroupValidator';

/**
 *
 */
export class ValidationHandler<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    /**
     *
     */
    constructor(private readonly groupValidators: ReadonlyArray<TypedGroupValidator<TExecutionContext, TRowType>>) {}

    /**
     *
     */
    preValidate(rows: ReadonlyArray<AnyBaseRowType>): void {
        this.validateByType(rows, TableRowType.PreConfiguration);
    }

    /**
     *
     */
    validate(rows: ReadonlyArray<AnyBaseRowType>): void {
        this.validateByType(rows);
    }

    /**
     *
     */
    private validateByType(rows: ReadonlyArray<AnyBaseRowType>, rowType: TableRowType = null): void {
        const rowsData = rows.map((row) => row.data);

        // validate each row
        rows.filter((row) => rowType == null || row.data._metaDefinition.type === rowType) //
            .forEach((row) => {
                row.data._metaDefinition.validators?.forEach((validator) => {
                    validator.validate(row.data, rowsData);
                });
            });

        // validate rows as group
        this.groupValidators?.forEach((validator) => {
            validator.validate(rowsData);
        });
    }
}
