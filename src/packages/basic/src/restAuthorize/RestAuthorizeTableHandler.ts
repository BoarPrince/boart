import {
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    GroupRowDefinition,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import {
    DependsOnValidator,
    DependsOnValueValidator,
    OutStoreExecutionUnit,
    RequiredValidator,
    UniqueValidator,
    ValueValidator
} from '@boart/core-impl';

import { GrantType } from './GrantType';
import { RestAuthorizeContext } from './RestAuthorizeContext';
import { RestAuthorizeExecutionUnit } from './RestAuthorizeExecutionUnit';

/**
 *
 */
export default class RestAuthorizeTableHandler extends TableHandlerBaseImpl<RestAuthorizeContext, DefaultRowType<RestAuthorizeContext>> {
    /**
     *
     */
    rowType = () => DefaultRowType;

    /**
     *
     */
    mainExecutionUnit = () => new RestAuthorizeExecutionUnit();

    /**
     *
     */
    newContext = (): RestAuthorizeContext => ({
        config: {
            url: '',
            grantType: '',
            retryCount: 2,
            retryPause: 5,
            clientId: '',
            clientSecret: '',
            scope: '',
            username: '',
            password: ''
        },
        preExecution: null,
        execution: {
            data: null,
            transformed: null,
            header: null,
            token: ''
        }
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RestAuthorizeContext, DefaultRowType<RestAuthorizeContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));

        tableHandler.removeRowDefinition('payload');
        tableHandler.removeRowDefinition('store');
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<RestAuthorizeContext, DefaultRowType<RestAuthorizeContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('url'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'url'),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('retry:count'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'retryCount'),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('retry:pause'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'retryPause'),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('grantType'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'grantType'),
                validators: [
                    new UniqueValidator(),
                    new ValueValidator('value', [
                        {
                            value: GrantType.ClientCredentials,
                            validators: [
                                new DependsOnValidator(['clientId']),
                                new DependsOnValidator(['clientSecret']),
                                new DependsOnValidator(['clientId']),
                                new DependsOnValidator(['scope'])
                            ]
                        },
                        {
                            value: GrantType.Password,
                            validators: [
                                new DependsOnValidator(['username']),
                                new DependsOnValidator(['password']),
                                new DependsOnValidator(['clientId']),
                                new DependsOnValidator(['scope'])
                            ]
                        }
                    ])
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('clientId'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'clientId'),
                validators: [
                    new UniqueValidator(),
                    new DependsOnValueValidator([
                        {
                            key: 'grantType',
                            value: 'client_credentials',
                            column: 'value'
                        },
                        {
                            key: 'grantType',
                            value: 'password',
                            column: 'value'
                        }
                    ])
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('clientSecret'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'clientSecret'),
                validators: [
                    new UniqueValidator(),
                    new DependsOnValueValidator({
                        key: 'grantType',
                        value: 'client_credentials',
                        column: 'value'
                    })
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('scope'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'scope'),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'username'),
                validators: [
                    new UniqueValidator(),
                    new DependsOnValueValidator({
                        key: 'grantType',
                        value: 'password',
                        column: 'value'
                    })
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('password'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'password'),
                validators: [
                    new UniqueValidator(),
                    new DependsOnValueValidator({
                        key: 'grantType',
                        value: 'password',
                        column: 'value'
                    })
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                type: TableRowType.PostProcessing,
                executionUnit: new OutStoreExecutionUnit('store'),
                default: {
                    column: 'value',
                    value: 'authorization'
                },
                validators: null
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RestAuthorizeContext, DefaultRowType<RestAuthorizeContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('url'), Symbol('grantType')]));
    }
}
