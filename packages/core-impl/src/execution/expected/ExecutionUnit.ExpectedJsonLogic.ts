import { DataContent, ExecutionUnit, ParaType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';
import { ParaValidator } from '../../validators/ParaValidator';

/**
 * | action                   | value |
 * |--------------------------|-------|
 * | expected:jsonLogic:true  | xxxx  |
 * | expected:jsonLogic:false | xxxx  |
 */
export class ExpectedJsonLogicExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly parameterType = ParaType.True;
    readonly validators = [new ParaValidator(['true', 'false'])];

    /**
     *
     */
    constructor(private executionType?: 'data' | 'header' | 'transformed') {}

    /**
     *
     */
    get description(): string {
        return !this.executionType ? 'expected:jsonLogic' : `expected:jsonLogic:${this.executionType}`;
    }

    /**
     *
     */
    private getDataContent(context: DataContext): DataContent {
        switch (this.executionType) {
            case 'header':
                return context.execution.header;

            case 'transformed':
                return context.execution.transformed;

            default:
                return context.execution.data;
        }
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = this.getDataContent(context)?.getText();

        if (row.actionPara === 'true') {
            JsonLogic.instance.checkTruthy(rule, data);
        } else {
            JsonLogic.instance.checkFalsy(rule, data);
        }
    }
}
