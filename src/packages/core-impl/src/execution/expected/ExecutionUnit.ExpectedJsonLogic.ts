import { DataContent, DataContentHelper, ExecutionContext, ExecutionUnit, ParaType } from '@boart/core';

import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { ParaValidator } from '../../validators/ParaValidator';

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
    readonly validators = [new ParaValidator(['true', 'false'])];

    /**
     *
     */
    constructor(private firstLevelType?: keyof DataContext['execution'], private secondLevelType?: string) {}

    /**
     *
     */
    get description(): string {
        return !this.firstLevelType ? 'expected:jsonLogic' : `expected:jsonLogic:${this.firstLevelType.toString()}`;
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

        if (row.actionPara === 'true') {
            JsonLogic.instance.checkTruthy(rule, data);
        } else {
            JsonLogic.instance.checkFalsy(rule, data);
        }
    }
}
