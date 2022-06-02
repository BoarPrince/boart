import { DataContent, DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';
import { JsonLogic } from '../../jsonlogic/JsonLogic';

/**
 * | action               | value |
 * |----------------------|-------|
 * | transform:jsonLogic  | xxxx  |
 */
export class TransformJsonLogicExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    readonly parameterType = ParaType.Optional;
    readonly selectorType = SelectorType.Optional;

    /**
     *
     */
    constructor(private executionType?: 'data' | 'header' | 'transformed') {}

    /** */
    get description(): string {
        switch (this.executionType) {
            case 'data':
                return 'transform:jsonLogic:data';

            case 'header':
                return 'transform:jsonLogic:header';

            case 'transformed':
                return 'transform:jsonLogic:transformed';

            default:
                return 'transform:jsonLogic';
        }
    }

    /**
     *
     */
    private getSourceData(context: DataContext): DataContent {
        switch (this.executionType) {
            case 'data':
                return context.execution.data;

            case 'header':
                return context.execution.header;

            default:
                return context.execution.transformed;
        }
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = this.getSourceData(context).getText();

        const transformedResult = DataContentHelper.create(JsonLogic.instance.transform(rule, data));

        context.execution.transformed = !row.selector
            ? transformedResult
            : DataContentHelper.setByPath(row.selector, transformedResult, context.execution.transformed);
    }
}
