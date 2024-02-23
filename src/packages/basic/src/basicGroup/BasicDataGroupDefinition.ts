import {
    DefaultContext,
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    DataContentHelper,
    GroupRowDefinition,
    ParaType,
    RowDefinition,
    SelectorType,
    TableRowType
} from '@boart/core';
import {
    ExpectedDataExecutinoUnit,
    ExpectedJsonLogicExecutionUnit,
    OutStoreExecutionUnit,
    TransformJPathExecutionUnit,
    TransformJsonLogicExecutionUnit,
    TransformResetExecutionUnit
} from '@boart/core-impl';

/**
 *
 */
export function initialize() {
    if (GroupRowDefinition.contains('basic-data')) {
        return;
    }

    const basicGroup = GroupRowDefinition.getInstance<DefaultContext, DefaultRowType<DefaultContext>>('basic-data');

    //-------------------------------------------------------------------------
    // Set Payload
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            key: Symbol('payload'),
            type: TableRowType.PreProcessing,
            parameterType: ParaType.False,
            selectorType: SelectorType.Optional,
            executionUnit: new DefaultPropertySetterExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>(
                'preExecution',
                'payload',
                {
                    defaultTypeConverter: (value) => DataContentHelper.create(value)
                }
            ),
            validators: null
        })
    );

    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            key: Symbol('in'),
            type: TableRowType.PreProcessing,
            parameterType: ParaType.False,
            selectorType: SelectorType.Optional,
            executionUnit: new DefaultPropertySetterExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>(
                'preExecution',
                'payload',
                {
                    defaultTypeConverter: (value) => DataContentHelper.create(value)
                }
            ),
            validators: null
        })
    );

    //-------------------------------------------------------------------------
    // Expected
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedDataExecutinoUnit(),
            validators: null
        })
    );
    //-------------------------------------------------------------------------
    // Expected:JsonLogic
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new ExpectedJsonLogicExecutionUnit(),
            validators: null
        })
    );
    //-------------------------------------------------------------------------
    // Transform
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new TransformJPathExecutionUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new TransformJsonLogicExecutionUnit(),
            validators: null
        })
    );
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new TransformResetExecutionUnit(),
            validators: null
        })
    );

    //-------------------------------------------------------------------------
    // OutStore
    //-------------------------------------------------------------------------
    basicGroup.addRowDefinition(
        new RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
            type: TableRowType.PostProcessing,
            executionUnit: new OutStoreExecutionUnit('store'),
            validators: null
        })
    );
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();

export default GroupRowDefinition.getInstance<DefaultContext, DefaultRowType<DefaultContext>>('basic-data');
