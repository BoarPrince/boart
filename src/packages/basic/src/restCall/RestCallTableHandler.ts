import {
    ASTVariable,
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

import { ContextMethod, RestCallContext } from './RestCallContext';
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
            method: {
                type: '',
                url: ''
            },
            payload: null,
            query: null,
            header: new ObjectContent(),
            param: new ObjectContent(),
            formData: new ObjectContent(),
            authorization: null
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
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
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
                selectorType: SelectorType.Optional,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'header'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('payload'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                selectorType: SelectorType.Optional,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'payload'),
                validators: [new DependsOnValidator(['method:post', 'method:put', 'method:patch', 'method:post-param', 'method:form-data'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('query'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                selectorType: SelectorType.True,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'query', {
                    actionSelectorSetter: (value: ContentType, rowValue: ContentType, ast: ASTVariable): ContentType =>
                        `${!value ? '' : value?.toString() + '&'}${ast.match}=${rowValue?.toString() || ''}`,
                    actionSelectorModifier: (rowValue: ContentType): ContentType => encodeURIComponent(rowValue.toString())
                }),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('authorization'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>(
                    'preExecution',
                    'authorization'
                ),
                defaultValue: '${store?:authorization}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('method'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.True,
                executionUnit: new PropertySetterExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>>('preExecution', 'method', {
                    defaultSetter: (method: ContextMethod, rowValue: ContentType, para: string): ContextMethod => {
                        method.url = rowValue.toString();
                        method.type = para;
                        return method;
                    }
                }),
                validators: [new UniqueValidator(), new ParaValidator(['post', 'get', 'delete', 'put', 'patch', 'form-data', 'post-param'])]
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
