import { ExecutionContext } from '../execution/ExecutionContext';
import { AnyBaseRowType, BaseRowType } from '../table/BaseRowType';

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
    validate(rows: ReadonlyArray<AnyBaseRowType>): void {
        const rowsData = rows.map(row => row.data);

        // validate each row
        rows.forEach(row => {
            row.data._metaDefinition.validators?.forEach(validator => {
                validator.validate(row.data, rowsData);
            });
        });

        // validate rows as group
        this.groupValidators?.forEach(validator => {
            validator.validate(rowsData);
        });
    }
}
