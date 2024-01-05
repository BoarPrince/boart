import {
    DataContent,
    DataContentHelper,
    ExecutionUnit,
    Description,
    ParaType,
    ScopedType,
    SelectorExtractor,
    SelectorType,
    StoreWrapper,
    VariableParser
} from '@boart/core';

import { DataContext, DataExecutionContext, DataPreExecutionContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { QualifierValidator } from '../../validators/QualifierValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';

/**
 * |action     |value |
 * |-----------|------|
 * | out:store | xxx  |
 *
 * |action       |value |
 * |-------------|------|
 * | out:store:l | xxx  |
 *
 * |action          |value |
 * |----------------|------|
 * | out:store:data | xxx  |
 *
 * |action            |value |
 * |------------------|------|
 * | out:store:data:l | xxx  |
 *
 * |action            |value |
 * |------------------|------|
 * | out:store:header | xxx  |
 *
 * |action              |value |
 * |--------------------|------|
 * | out:store:header:l | xxx  |
 */
export class OutStoreExecutionUnit<StoreContext extends DataContext> implements ExecutionUnit<StoreContext, RowTypeValue<StoreContext>> {
    private _key: string;
    readonly valueParser = new VariableParser();
    readonly selectorType = SelectorType.Optional;
    readonly parameterType = ParaType.Optional;
    readonly scopedType = ScopedType.Optional;
    readonly validators = [
        new QualifierValidator([{ qualifier: null, paras: null }]),
        new ValueRequiredValidator('value', 'name is missing')
    ];

    /**
     *
     */
    constructor();
    constructor(executionType: 'payload');
    constructor(executionType: keyof StoreContext['execution']);
    constructor(executionType: keyof StoreContext['execution'], executionKey: StoreContext['execution'][keyof StoreContext['execution']]);
    constructor(private executionType?: string, private executionKey?: string) {}

    /**
     *
     */
    get description(): () => Description {
        return () => ({
            id: '149e81d9-d334-44c6-b690-212f5e25bf80',
            dataScope: this.executionType,
            title: this._key || 'store',
            description: null,
            examples: null
        });
    }

    /**
     *
     */
    set key(key: string) {
        this._key = key;
    }

    /**
     *
     */
    private getDataContent(context: StoreContext): DataContent {
        const nonNullValue = (value: DataContent, nullValue?: DataContent) =>
            DataContentHelper.isNullOrUndefined(value) && nullValue !== undefined ? nullValue : value;

        if (this.executionType === 'payload') {
            return context.preExecution.payload;
        }

        const executionContext = context.execution || ({} as DataExecutionContext);
        const preExecutionContext = context.preExecution || ({} as DataPreExecutionContext);

        if (this.executionType) {
            return !this.executionKey
                ? executionContext[this.executionType] //
                : executionContext[this.executionType][this.executionKey];
        }

        return (
            nonNullValue(executionContext.transformed, null) ||
            nonNullValue(executionContext.data, null) ||
            nonNullValue(preExecutionContext.payload)
        );
    }

    /**
     *
     */
    execute(context: StoreContext, row: RowTypeValue<DataContext>): void {
        const value = this.getDataContent(context);
        const data = SelectorExtractor.getValueBySelector(row.ast.selectors, value);

        const store = StoreWrapper.getWrapperByScope(row.ast.scope?.value);
        const valueAst = this.valueParser.parseValue(row.value.toString());

        store.put(valueAst, data);
    }
}
