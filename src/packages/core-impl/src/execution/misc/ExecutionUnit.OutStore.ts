import {
    DataContent,
    DataContentHelper,
    DefaultContext,
    DefaultExecutionContext,
    DefaultPreExecutionContext,
    DefaultRowType,
    ExecutionUnit,
    Description,
    ParaType,
    ScopedType,
    SelectorExtractor,
    SelectorType,
    StoreWrapper,
    VariableParser
} from '@boart/core';

import { QualifierValidator } from '../../validators/QualifierValidator';
import { ValueRequiredValidator } from '../../validators/ValueRequiredValidator';
import { DataScope } from '@boart/core/lib/parser/ast/DataScope';
import { DataScopeValidator } from '../../validators/DataScopeValidator';

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
export class OutStoreExecutionUnit<StoreContext extends DefaultContext>
    implements ExecutionUnit<StoreContext, DefaultRowType<StoreContext>>
{
    get key() {
        return Symbol(this._key);
    }
    readonly valueParser = new VariableParser();
    readonly selectorType = SelectorType.Optional;
    readonly parameterType = ParaType.Optional;
    readonly scopedType = ScopedType.Optional;
    readonly validators = [
        new DataScopeValidator(['data', 'header', 'transformed', 'payload', '']),
        new QualifierValidator([{ qualifier: null, paras: null }]),
        new ValueRequiredValidator('value', 'name is missing')
    ];

    /**
     *
     */
    constructor(private _key: string) {}

    /**
     *
     */
    get description(): () => Description {
        return () => ({
            id: '149e81d9-d334-44c6-b690-212f5e25bf80',
            description: null,
            examples: null
        });
    }

    /**
     *
     */
    private getDataContent(context: StoreContext, dataScope: DataScope): DataContent {
        const nonNullValue = (value: object, nullValue?: DataContent): DataContent =>
            DataContentHelper.isNullOrUndefined(value) && nullValue !== undefined ? nullValue : DataContentHelper.create(value);

        const scope = dataScope?.value;
        if (scope === 'payload') {
            return DataContentHelper.create(context.preExecution.payload);
        }

        const executionContext = context.execution || ({} as DefaultExecutionContext);

        if (scope) {
            return DataContentHelper.create(executionContext[scope]);
        } else {
            const preExecutionContext = context.preExecution || ({} as DefaultPreExecutionContext);
            return (
                nonNullValue(executionContext.transformed, null) ||
                nonNullValue(executionContext.data, null) ||
                nonNullValue(preExecutionContext.payload)
            );
        }
    }

    /**
     *
     */
    execute(context: StoreContext, row: DefaultRowType<DefaultContext>): void {
        const value = this.getDataContent(context, row.ast.datascope);
        const data = SelectorExtractor.getValueBySelector(row.ast.selectors, value);

        const store = StoreWrapper.getWrapperByScope(row.ast.scope?.value);
        const valueAst = this.valueParser.parseValue(row.value.toString());

        store.put(valueAst, data);
    }
}
