import { DataContent, DataContentHelper, Description, ExecutionContext, ExecutionUnit, ParaType } from '@boart/core';

import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { QualifierValidator } from '../../validators/QualifierValidator';

/**
 * | action                   | value |
 * |--------------------------|-------|
 * | expected:jsonLogic:true  | xxxx  |
 * | expected:jsonLogic:false | xxxx  |
 */
export class ExpectedJsonLogicExecutionUnit<DataContext extends ExecutionContext<object, object, object>>
    implements ExecutionUnit<DataContext, RowTypeValue<DataContext>>
{
    readonly parameterType = ParaType.True;
    readonly validators = [new QualifierValidator([{ qualifier: 'jsonLogic', paras: ['true', 'false'] }])];

    /**
     *
     */
    constructor(
        private firstLevelType?: keyof DataContext['execution'],
        private secondLevelType?: string
    ) {}

    /**
     *
     */
    get description(): Description {
        return {
            id: '67deb7f1-9943-4e58-a335-6e19da22d3eb',
            title: 'expected:jsonLogic',
            dataScope: this.firstLevelType?.toString(),
            description: null,
            examples: null
        };
    }

    /**
     *
     */
    private getDataContent(context: DataContext): DataContent {
        const firstLevelType = this.firstLevelType?.toString() || 'data';
        const secondLevelType = this.secondLevelType?.toString();

        return !secondLevelType //
            ? context.execution[firstLevelType]
            : context.execution[firstLevelType][secondLevelType];
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = DataContentHelper.create(this.getDataContent(context)).getText();

        if (row.ast.qualifier?.paras?.[0] === 'true') {
            JsonLogic.instance.checkTruthy(rule, data);
        } else {
            JsonLogic.instance.checkFalsy(rule, data);
        }
    }
}
