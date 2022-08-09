import {
    ContentType,
    GroupRowDefinition,
    ObjectContent,
    ParaType,
    RowDefinition,
    SelectorType,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import {
    DependsOnValidator,
    ParaValidator,
    PropertySetterExecutionUnit,
    RequiredValidator,
    RowTypeValue,
    UniqueValidator
} from '@boart/core-impl';

import { RestCallContext, RestCallPreExecutionContext } from './RestCallContext';
import { RestCallExecutionUnit } from './RestCallExecutionUnit';

/**
 *
 */
export default class RestCallTableHandler extends TableHandlerBaseImpl<RestCallContext, RowTypeValue<RestCallContext>> {
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
    newContext = (): RestCallContext => ({
        config: {
            value: ''
        },
        preExecution: {
            method: '',
            url: '',
            payload: null,
            query: null,
            header: null,
            param: new ObjectContent(),
            formData: new ObjectContent(),
            authentication: null
        },
        execution: {
            data: null,
            transformed: null,
            header: null
        }
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RestCallContext, RowTypeValue<RestCallContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<RestCallContext, RowTypeValue<RestCallContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('form-data'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                selectorType: SelectorType.True,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'formData'),
                validators: [new DependsOnValidator(['method:form-data'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('param'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                selectorType: SelectorType.True,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'param'),
                validators: [new DependsOnValidator(['method:post-param'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('header'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'header', {
                    actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType => {
                        (value as object)[para] = rowValue;
                        return value;
                    }
                }),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('payload'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'payload'),
                validators: [new DependsOnValidator(['method:post', 'method:put'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('query'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'query'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('authentication'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>(
                    'preExecution',
                    'authentication'
                ),
                defaultValue: '${store?:authentication}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('method'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.True,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', null, {
                    defaultSetter: (
                        context: RestCallPreExecutionContext,
                        rowValue: ContentType,
                        para: string
                    ): RestCallPreExecutionContext => {
                        context.url = rowValue.toString();
                        context.method = para;
                        return context;
                    }
                }),
                validators: [new UniqueValidator(), new ParaValidator(['post', 'get', 'delete', 'put', 'form-data', 'post-param'])]
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RestCallContext, RowTypeValue<RestCallContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('method')]));
    }
}
