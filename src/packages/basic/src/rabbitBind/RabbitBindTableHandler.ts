import {
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    GroupRowDefinition,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import { BoolValidator, IntValidator, RequiredValidator, UniqueValidator } from '@boart/core-impl';

import { RabbitBindContext } from './RabbitBindContext';
import { RabbitBindExecutionUnit } from './RabbitBindExecutionUnit';

/**
 *
 */
export default class RabbitBindTableHandler extends TableHandlerBaseImpl<RabbitBindContext, DefaultRowType<RabbitBindContext>> {
    /**
     *
     */
    rowType = () => DefaultRowType;

    /**
     *
     */
    mainExecutionUnit = () => new RabbitBindExecutionUnit();

    /**
     *
     */
    newContext = (): RabbitBindContext => ({
        config: {
            queue: '',
            exchange: '',
            routing: [],
            queue_create: true,
            queue_delete: true,
            username: '',
            password: '',
            hostname: '',
            port: 0,
            vhost: '/'
        },
        preExecution: null,
        execution: null
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RabbitBindContext, DefaultRowType<RabbitBindContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     * rabbit consumer definitions (name, timeout, count, ...)
     */
    addRowDefinition(tableHandler: TableHandler<RabbitBindContext, DefaultRowType<RabbitBindContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
                    'config',
                    'exchange'
                ),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('routing'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
                    'config',
                    'routing'
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('queue:create'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
                    'config',
                    'queue_create'
                ),
                validators: [new BoolValidator('value'), new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('queue:delete'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitBindContext, DefaultRowType<RabbitBindContext>>(
                    'config',
                    'queue_delete'
                ),
                validators: [new BoolValidator('value')]
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RabbitBindContext, DefaultRowType<RabbitBindContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('queue'), Symbol('exchange')]));
    }
}
