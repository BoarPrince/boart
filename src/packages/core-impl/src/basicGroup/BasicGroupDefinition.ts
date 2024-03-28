import { DefaultContext, DefaultRowType, GroupRowDefinition, RowDefinition, TableRowType } from '@boart/core';
import { AnyContext } from '../AnyContext';
import { RunOnlyExecutionUnit } from '../execution/run/ExecutionUnit.RunOnly';
import { RunNotExecutionUnit } from '../execution/run/ExecutionUnit.RunNot';
import { RunNotEmptyExecutionUnit } from '../execution/run/ExecutionUnit.RunNotEmpty';
import { RunEnvExecutionUnit } from '../execution/run/ExecutionUnit.RunEnv';
import { WaitExecutionUnit } from '../execution/misc/ExecutionUnit.Wait';
import { QualifierValidator } from '../validators/QualifierValidator';
import { DescriptionExecutionUnit } from '../execution/misc/ExecutionUnit.Description';
import { LinkExecutionUnit } from '../execution/misc/ExecutionUnit.Link';
import { GroupExecutionUnit } from '../execution/misc/ExecutionUnit.Group';

/**
 *
 */
export function initialize() {
    if (GroupRowDefinition.contains('basic-group-definition')) {
        return;
    }

    const basicGroup = GroupRowDefinition.getInstance<AnyContext, DefaultRowType<AnyContext>>('basic-group-definition');

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
            validators: [
                new QualifierValidator([
                    { qualifier: null, paras: null },
                    { qualifier: 'after', paras: ['', 'sec', 'min'] },
                    { qualifier: 'sec', paras: null },
                    { qualifier: 'min', paras: null }
                ])
            ]
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            key: Symbol('wait:before'),
            type: TableRowType.Configuration,
            executionUnit: new WaitExecutionUnit(),
            validators: [
                new QualifierValidator([
                    { qualifier: null, paras: null },
                    { qualifier: 'before', paras: ['', 'sec', 'min'] },
                    { qualifier: 'sec', paras: null },
                    { qualifier: 'min', paras: null }
                ])
            ]
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.Configuration,
            executionUnit: new DescriptionExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.PostProcessingForced,
            executionUnit: new LinkExecutionUnit(),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition({
            type: TableRowType.Configuration,
            executionUnit: new GroupExecutionUnit(),
            validators: null
        })
    );
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();

export default GroupRowDefinition.getInstance<DefaultContext, DefaultRowType<DefaultContext>>('basic-group-definition');
