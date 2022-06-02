import { DataContentHelper, ExecutionUnit, ParaType, SelectorType } from '@boart/core';
import JSPath from 'jspath';

import { DataContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

/**
 * | action          | value |
 * |-----------------|-------|
 * | transform:jpath | xxxx  |
 */
export class TransformJPathExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
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
                return 'transform:jpath:data';

            case 'header':
                return 'transform:jpath:header';

            case 'transformed':
                return 'transform:jpath:transformed';

            default:
                return 'transform:jpath';
        }
    }

    /**
     *
     */
    private getSourceData(context: DataContext): object {
        const sourceFacade = () => {
            switch (this.executionType) {
                case 'data':
                    return context.execution.data;

                case 'header':
                    return context.execution.header;

                default:
                    return context.execution.transformed;
            }
        };

        return JSON.parse(sourceFacade().toJSON()) as object;
    }

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): void {
        const rule = row.value.toString();
        const data = this.getSourceData(context);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const transformedValue = JSPath.apply(rule, data) as ReadonlyArray<object>;
        if (!transformedValue || (Array.isArray(transformedValue) && transformedValue.length === 0)) {
            throw new Error(`cannot evaluate jpath expression, rule: '${rule}', data: ${JSON.stringify(data)}`);
        }

        const transformedResult =
            Array.isArray(transformedValue) && transformedValue.length === 1
                ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  DataContentHelper.create(transformedValue[0])
                : DataContentHelper.create(transformedValue);

        context.execution.transformed = !row.selector
            ? transformedResult
            : DataContentHelper.setByPath(row.selector, transformedResult, context.execution.transformed);
    }
}
