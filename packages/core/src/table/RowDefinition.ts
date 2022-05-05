import { RowValidator } from '../Validators/RowValidator';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionUnit } from '../execution/ExecutionUnit';

import { BaseRowType } from './BaseRowType';
import { ParaType } from './ParaType';
import { TableRowType } from './TableRowType';

/**
 *
 */
interface RowDefinitionPara<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    readonly key?: symbol;
    readonly type: TableRowType;
    readonly defaultValue?: string | number | boolean;
    readonly defaultValueColumn?: symbol;
    readonly executionUnit: ExecutionUnit<TExecutionContext, TRowType>;
    readonly parameterType?: ParaType;
    readonly validators: ReadonlyArray<RowValidator>;
}

/**
 *
 */
export class RowDefinition<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    public readonly key: symbol;
    public readonly type: TableRowType;
    public readonly defaultValue?: string | number | boolean;
    public readonly defaultValueColumn?: symbol;
    public readonly executionUnit: ExecutionUnit<TExecutionContext, TRowType>;
    public readonly parameterType: ParaType = ParaType.False;
    public readonly validators = new Array<RowValidator>();

    /**
     *
     */
    constructor(value: RowDefinitionPara<TExecutionContext, TRowType>) {
        this.key = value.key || Symbol(value.executionUnit?.description);
        this.type = value.type;
        this.defaultValue = value.defaultValue;
        this.defaultValueColumn = value.defaultValueColumn || this.defaultValueColumn;
        this.executionUnit = value.executionUnit;
        this.parameterType = value.executionUnit?.parameterType || value.parameterType || this.parameterType;
        this.validators = (value.executionUnit?.validators || []).concat(value.validators || []);
    }
}
