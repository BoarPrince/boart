import { Description } from '../description/Description';
import { DescriptionHandler } from '../description/DescriptionHandler';
import { Descriptionable } from '../description/Descriptionable';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { ParaType } from '../types/ParaType';
import { ScopedType } from '../types/ScopedType';
import { SelectorType } from '../types/SelectorType';
import { RowValidator } from '../validators/RowValidator';

import { BaseRowType } from './BaseRowType';
import { RowValue } from './RowValue';
import { TableRowType } from './TableRowType';

/**
 *
 */
type DefaultValue<TExecutionContext extends ExecutionContext<object, object, object>, TRowType extends BaseRowType<TExecutionContext>> = {
    column: keyof TRowType;
    value: string | number | boolean | ((rows: ReadonlyArray<RowValue>) => string | number | boolean);
};

/**
 *
 */
interface RowDefinitionPara<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> extends Descriptionable {
    readonly key?: symbol;
    readonly dataScope?: symbol;
    readonly qualifier?: symbol;
    readonly priority?: number;
    readonly type: TableRowType;
    readonly defaultValue?: string | number | boolean | ((rows: ReadonlyArray<RowValue>) => string | number | boolean);
    readonly defaultValueColumn?: symbol;
    readonly default?: DefaultValue<TExecutionContext, TRowType>;
    readonly executionUnit: ExecutionUnit<TExecutionContext, TRowType> | null;
    readonly parameterType?: ParaType;
    readonly selectorType?: SelectorType;
    readonly scopedType?: ScopedType;
    readonly validators: ReadonlyArray<RowValidator> | null;
}

/**
 *
 */
export class RowDefinition<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> implements Descriptionable
{
    public key: symbol;
    public dataScope?: symbol;
    public defaultValue?: string | number | boolean | ((rows: ReadonlyArray<RowValue>) => string | number | boolean);
    public defaultValueColumn?: symbol;
    public description?: Description;
    public readonly priority: number = 0;
    public readonly type: TableRowType;
    public readonly executionUnit: ExecutionUnit<TExecutionContext, TRowType>;
    public readonly parameterType: ParaType = ParaType.False;
    public readonly selectorType: SelectorType = SelectorType.False;
    public readonly scopedType: ScopedType = ScopedType.False;
    public readonly dataScopeType: SelectorType = SelectorType.False;
    public readonly validators = new Array<RowValidator>();

    /**
     *
     */
    constructor(value: RowDefinitionPara<TExecutionContext, TRowType>) {
        this.key = value.key || Symbol(DescriptionHandler.solve(value.executionUnit?.description).title);
        this.dataScope = value.dataScope || Symbol(value.executionUnit?.description?.dataScope || 'data');
        this.type = value.type;
        this.description = value.description;
        this.priority = value.priority || value.executionUnit?.priority || this.priority;
        this.defaultValue = value.defaultValue || value.default?.value || this.defaultValue;
        this.defaultValueColumn =
            value.defaultValueColumn || (!value.default ? null : Symbol(value.default.column?.toString())) || this.defaultValueColumn;
        this.executionUnit = value.executionUnit;
        this.parameterType = value.executionUnit?.parameterType || value.parameterType || this.parameterType;
        this.selectorType = value.executionUnit?.selectorType || value.selectorType || this.selectorType;
        this.scopedType = value.executionUnit?.scopedType || value.scopedType || this.scopedType;
        this.validators = (value.executionUnit?.validators || []).concat(value.validators || []);
    }

    /**
     *
     */
    clone(): RowDefinition<TExecutionContext, TRowType> {
        return new RowDefinition(this);
    }
}
