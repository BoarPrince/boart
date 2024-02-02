import { DataContent, DataContentHelper, DefaultRowType, Description, ExecutionContext, ExecutionUnit, ParaType } from '@boart/core';

import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { QualifierValidator } from '../../validators/QualifierValidator';
import { DataScope } from '@boart/core/lib/parser/ast/DataScope';
import { DataScopeValidator } from '../../validators/DataScopeValidator';

/**
 * | action                   | value |
 * |--------------------------|-------|
 * | expected:jsonLogic:true  | xxxx  |
 * | expected:jsonLogic:false | xxxx  |
 */
export class ExpectedJsonLogicExecutionUnit<DataContext extends ExecutionContext<object, object, object>>
    implements ExecutionUnit<DataContext, DefaultRowType<DataContext>>
{
    readonly key = Symbol('expected:jsonLogic');
    readonly parameterType = ParaType.True;
    readonly validators = [
        new DataScopeValidator(['data', 'header', 'transformed', '']),
        new QualifierValidator([{ qualifier: 'jsonLogic', paras: ['true', 'false'] }])
    ];

    /**
     *
     */
    constructor() {}

    /**
     *
     */
    get description(): () => Description {
        return () => ({
            id: '67deb7f1-9943-4e58-a335-6e19da22d3eb',
            description: null,
            examples: null
        });
    }

    /**
     *
     */
    private getDataContent(context: DataContext, dataScope: DataScope): DataContent {
        return context.execution[dataScope?.value ?? 'data'];
    }

    /**
     *
     */
    execute(context: DataContext, row: DefaultRowType<DataContext>): void {
        const rule = row.value.toString();
        const data = DataContentHelper.create(this.getDataContent(context, row.ast.datascope)).getText();

        if (row.ast.qualifier?.paras?.[0] === 'true') {
            JsonLogic.instance.checkTruthy(rule, data);
        } else {
            JsonLogic.instance.checkFalsy(rule, data);
        }
    }
}
