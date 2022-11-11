import { GroupRowDefinition, RowDefinition, TableRowType } from '@boart/core';
import {
    AnyContext,
    DataContext,
    DescriptionExecutionUnit,
    GroupExecutionUnit,
    ParaValidator,
    RowTypeValue,
    RunEnvExecutionUnit,
    RunNotEmptyExecutionUnit,
    RunNotExecutionUnit,
    RunOnlyExecutionUnit,
    WaitExecutionUnit
} from '@boart/core-impl';

if (!GroupRowDefinition.contains('basic-group-definition')) {
    const basicGroup = GroupRowDefinition.getInstance<AnyContext, RowTypeValue<AnyContext>>('basic-group-definition');

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PreConfiguration,
            executionUnit: new RunOnlyExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PreConfiguration,
            executionUnit: new RunNotExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PreConfiguration,
            executionUnit: new RunNotEmptyExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PreConfiguration,
            executionUnit: new RunEnvExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            key: Symbol('wait:after'),
            type: TableRowType.PostProcessing,
            executionUnit: new WaitExecutionUnit(),
            validators: [new ParaValidator([null, 'sec', 'min'])]
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            key: Symbol('wait:before'),
            type: TableRowType.Configuration,
            executionUnit: new WaitExecutionUnit(),
            validators: [new ParaValidator([null, 'sec', 'min'])]
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            key: Symbol('description'),
            type: TableRowType.Configuration,
            executionUnit: new DescriptionExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            key: Symbol('group'),
            type: TableRowType.Configuration,
            executionUnit: new GroupExecutionUnit(),
            validators: null
        })
    );
}

export default GroupRowDefinition.getInstance<DataContext, RowTypeValue<DataContext>>('basic-group-definition');
