import { DataContent, DataContentHelper, ExecutionUnit, key, ParaType, ScopeType, SelectorType, StoreWrapper } from '@boart/core';
import { Description } from 'core/src/description/Description';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { ParaValidator } from '../../validators/ParaValidator';
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
    readonly selectorType = SelectorType.Optional;
    readonly parameterType = ParaType.Optional;
    readonly validators = [
        new ParaValidator([ScopeType.Global, ScopeType.Local, ScopeType.Step, ScopeType.Test]),
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
    get description(): Description {
        return {
            id: '149e81d9-d334-44c6-b690-212f5e25bf80',
            title: this._key || !this.executionType ? 'store' : `store:${this.executionType}`,
            description: null,
            examples: null
        };
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

        if (!!this.executionType) {
            return !this.executionKey
                ? context.execution[this.executionType] //
                : context.execution[this.executionType][this.executionKey];
        }

        return (
            nonNullValue(context.execution.transformed, null) ||
            nonNullValue(context.execution.data, null) ||
            nonNullValue(context.preExecution.payload)
        );
    }

    /**
     *
     */
    execute(context: StoreContext, row: RowTypeValue<DataContext>): void {
        const storeNameAndSelector = row.value.toString();

        const value = this.getDataContent(context);
        const data = !row.selector ? value : DataContentHelper.getByPath(row.selector, value);

        const store = StoreWrapper.getWrapperByScope(row.actionPara);
        store.put(storeNameAndSelector, data);
    }
}
