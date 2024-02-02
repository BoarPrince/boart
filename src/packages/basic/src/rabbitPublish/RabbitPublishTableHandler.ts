import {
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    GroupRowDefinition,
    ObjectContent,
    ParaType,
    RowDefinition,
    SelectorType,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import { DependsOnValueValidator, IntValidator, RequiredValidator, XORValidator } from '@boart/core-impl';

import { RabbitPublishContext } from './RabbitPublishContext';
import { RabbitPublishExecutionUnit } from './RabbitPublishExecutionUnit';
import { PublishType } from './RabbitPublishType';

/**
 *
 */
export default class RabbitPublishTableHandler extends TableHandlerBaseImpl<RabbitPublishContext, DefaultRowType<RabbitPublishContext>> {
    /**
     *
     */
    rowType = () => DefaultRowType;

    mainExecutionUnit = () => new RabbitPublishExecutionUnit();

    /**
     *
     */
    newContext = (): RabbitPublishContext => ({
        config: {
            queue_or_exhange: '',
            type: null,
            username: '',
            password: '',
            hostname: '',
            port: 5672,
            vhost: '/'
        },
        preExecution: {
            payload: new ObjectContent(),
            header: new ObjectContent(),
            correlationId: '',
            messageId: '',
            routing: []
        },
        execution: null
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     * rabbit consumer definitions (name, timeout, count, ...)
     */
    addRowDefinition(tableHandler: TableHandler<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'config',
                    'queue_or_exhange'
                ),
                validators: [new DependsOnValueValidator({ key: 'type', value: 'queue', column: 'value' })]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('exchange'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'config',
                    'queue_or_exhange'
                ),
                validators: [new DependsOnValueValidator({ key: 'type', value: 'exchange', column: 'value' })]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('type'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'config',
                    'type'
                ),
                defaultValueColumn: Symbol('value'),
                defaultValue: (rows) => (rows.find((r) => r.key === 'queue') ? PublishType.Queue : PublishType.Exchange),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('routing'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'preExecution',
                    'routing'
                ),
                validators: [
                    new DependsOnValueValidator({
                        key: 'type',
                        value: 'exchange',
                        column: 'value'
                    })
                ]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('correlationId'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'preExecution',
                    'correlationId'
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('messageId'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'preExecution',
                    'messageId'
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('header'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                selectorType: SelectorType.Optional,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'preExecution',
                    'header'
                ),
                validators: null
            })
        );

        tableHandler.removeRowDefinition('payload');
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('payload'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                selectorType: SelectorType.Optional,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>(
                    'preExecution',
                    'payload'
                ),
                validators: null
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RabbitPublishContext, DefaultRowType<RabbitPublishContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('type'), Symbol('payload')]));
        tableHandler.addGroupValidator(new XORValidator([Symbol('queue'), Symbol('exchange')]));
    }
}
