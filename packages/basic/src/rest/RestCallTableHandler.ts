import { GroupRowDefinition, ParaType, RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { ParaValidator, PropertySetterExecutionUnit, RequiredValidator, RowTypeValue, UniqueValidator } from '@boart/core-impl';

import { RestCallContext } from './RestCallContext';
import { RestCallExecutionUnit } from './RestCallExecutionUnit';

/**
 *
 */
export default class RestCallTableHandler extends TableHandlerBaseImpl<RestCallContext, RowTypeValue<RestCallContext>> {
    private readonly key_body = Symbol('body');
    private readonly key_query = Symbol('query');
    private readonly key_method = Symbol('method');

    /**
     *
     */
    rowType = () => RowTypeValue;

    /**
     *
     */
    mainExecutionUnit = () => new RestCallExecutionUnit();

    /**
     *
     */
    newContext = () => ({
        config: {
            value: ''
        },
        preExecution: {
            method: '',
            payload: '',
            query: '',
            url: ''
        },
        execution: {
            data: null,
            header: null
        }
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RestCallContext, RowTypeValue<RestCallContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<RestCallContext, RowTypeValue<RestCallContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: this.key_body,
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'payload'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: this.key_query,
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'query'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: this.key_method,
                type: TableRowType.PreProcessing,
                parameterType: ParaType.True,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'method'),
                validators: [new UniqueValidator(), new ParaValidator(['post', 'get', 'delete', 'put', 'form-data', 'post-param'])]
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RestCallContext, RowTypeValue<RestCallContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([this.key_method]));
    }
}
