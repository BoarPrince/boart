import {
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    GroupRowDefinition,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import { DependsOnValidator, RequiredValidator, UniqueValidator, XORValidator } from '@boart/core-impl';
import { IntValidator } from '@boart/core-impl';

import { RabbitListenerContext } from './RabbitListenerContext';
import { RabbitListenerExecutionUnit } from './RabbitListenerExecutionUnit';

/**
 *
 */
export default class RabbitListenerTableHandler extends TableHandlerBaseImpl<RabbitListenerContext, DefaultRowType<RabbitListenerContext>> {
    /**
     *
     */
    rowType = () => DefaultRowType;

    /**
     *
     */
    mainExecutionUnit = () => new RabbitListenerExecutionUnit();

    /**
     *
     */
    newContext = (): RabbitListenerContext => ({
        config: {
            queue: '',
            storeName: '',
            exchange: '',
            routing: [],
            username: '',
            password: '',
            hostname: '',
            port: 5672,
            vhost: '/'
        },
        preExecution: null,
        execution: null
    });

    /**
     * rabbit consumer definitions (name, timeout, count, ...)
     */
    addRowDefinition(tableHandler: TableHandler<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'username'
                ),
                defaultValue: '${env?:rabbitmq_username}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('password'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'password'
                ),
                defaultValue: '${env?:rabbitmq_password}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('hostname'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'hostname'
                ),
                defaultValue: '${env?:rabbitmq_hostname}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('vhost'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'vhost'
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('port'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'port'
                ),
                defaultValue: '${env?:rabbitmq_port}',
                defaultValueColumn: Symbol('value'),
                validators: [new IntValidator('value')]
            })
        );

        /**
         * Basic
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('queue'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'queue'
                ),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('exchange'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'exchange'
                ),
                validators: [new UniqueValidator(), new DependsOnValidator(['routing'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('routing'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'routing'
                ),
                validators: [new DependsOnValidator(['exchange'])]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('store:name'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>(
                    'config',
                    'storeName'
                ),
                validators: []
            })
        );
    }

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RabbitListenerContext, DefaultRowType<RabbitListenerContext>>) {
        tableHandler.addGroupValidator(new XORValidator([Symbol('queue'), Symbol('exchange')]));
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('store:name')]));
    }
}
