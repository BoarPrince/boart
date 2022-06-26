import { GroupRowDefinition, RowDefinition, TableRowType } from '@boart/core';
import {
    DataContext,
    ExpectedDataExecutinoUnit,
    ExpectedJsonLogicExecutionUnit,
    OutStoreExecutionUnit,
    RowTypeValue,
    TransformJPathExecutionUnit,
    TransformJsonLogicExecutionUnit,
    TransformResetExecutionUnit
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
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedJsonLogicExecutionUnit('data'),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedJsonLogicExecutionUnit('header'),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DataContext, RowTypeValue<DataContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedJsonLogicExecutionUnit('transformed'),
            validators: null
        })
    );
    //-------------------------------------------------------------------------
    // Transform
    //-------------------------------------------------------------------------
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
            executionUnit: new TransformResetExecutionUnit(),
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
