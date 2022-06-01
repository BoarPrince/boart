import { GroupRowDefinition, RowDefinition, TableRowType } from '@boart/core';
import {
    DataContext,
    ExpectedDataExecutinoUnit,
    ExpectedHeaderExecutinoUnit,
    ExpectedJsonLogicExecutionUnit,
    OutStoreExecutionUnit,
    RowTypeValue,
    TransformJPathExecutionUnit,
    TransformJsonLogicExecutionUnit
} from '@boart/core-impl';

if (!GroupRowDefinition.contains('basic-data')) {
    const basicGroup = GroupRowDefinition.getInstance<DataContext, RowTypeValue<DataContext>>('basic-data');

    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedDataExecutinoUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedHeaderExecutinoUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedJsonLogicExecutionUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new TransformJPathExecutionUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new TransformJsonLogicExecutionUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new OutStoreExecutionUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new OutStoreExecutionUnit('data'),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new OutStoreExecutionUnit('header'),
            validators: null
        })
    );
}

export default GroupRowDefinition.getInstance<DataContext, RowTypeValue<DataContext>>('basic-data');
