import { GroupRowDefinition, RowDefinition, TableRowType } from '@boart/core';
import {
    DataContext,
    ExpectedDataExecutinoUnit,
    ExpectedJsonLogicExecutionUnit,
    OutStoreExecutionUnit,
    RowTypeValue,
    TransformJPathExecutionUnit
} from '@boart/core-impl';

if (!GroupRowDefinition.contains('basic-data')) {
    const basicGroup = GroupRowDefinition.getInstance<DataContext, RowTypeValue<DataContext>>('basic-data');

    //-------------------------------------------------------------------------
    // Expected
    //-------------------------------------------------------------------------
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
            executionUnit: new ExpectedDataExecutinoUnit('data'),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedDataExecutinoUnit('header'),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedDataExecutinoUnit('transformed'),
            validators: null
        })
    );
    //-------------------------------------------------------------------------
    // Expected:JsonLogic
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedJsonLogicExecutionUnit(),
            validators: null
        })
    );
    //-------------------------------------------------------------------------
    // Expected:JPath
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new TransformJPathExecutionUnit(),
            validators: null
        })
    );
    //-------------------------------------------------------------------------
    // OutStore
    //-------------------------------------------------------------------------
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
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new OutStoreExecutionUnit('transformed'),
            validators: null
        })
    );
}

export default GroupRowDefinition.getInstance<DataContext, RowTypeValue<DataContext>>('basic-data');
