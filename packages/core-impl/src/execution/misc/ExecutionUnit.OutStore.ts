import { DataContent, DataContentHelper, ExecutionUnit, ParaType, ScopeType, SelectorType, StoreWrapper } from '@boart/core';

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
export class OutStoreExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly selectorType = SelectorType.Optional;
    readonly parameterType = ParaType.Optional;
    readonly validators = [
        new ParaValidator([ScopeType.Global, ScopeType.Local, ScopeType.Step, ScopeType.Test]),
        new ValueRequiredValidator('value')
    ];

    /**
     *
     */
    constructor(private executionType?: 'data' | 'header') {}

    /** */
    get description(): string {
        switch (this.executionType) {
            case 'data':
                return 'store:data';

            case 'header':
                return 'store:header';

            default:
                return 'store';
        }
    }

    /**
     *
     */
    private getDataContent(context: DataContext): DataContent {
        return this.executionType === 'header' ? context.execution.header : context.execution.data;
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const storeName = row.value.toString();

        const baseData = this.getDataContent(context);
        const data = !row.selector ? baseData : DataContentHelper.getByPath(row.selector, baseData);

        const store = StoreWrapper.getWrapperByScope(row.actionPara);
        store.put(storeName, data);
    }
}
