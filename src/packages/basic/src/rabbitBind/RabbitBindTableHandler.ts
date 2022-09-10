import { GroupRowDefinition, RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { PropertySetterExecutionUnit, RequiredValidator, RowTypeValue, UniqueValidator } from '@boart/core-impl';
import { BoolValidator } from '@boart/core-impl/src/validators/BoolValidator';
import { IntValidator } from '@boart/core-impl/src/validators/IntValidator';

import { RabbitBindContext } from './RabbitBindContext';
import { RabbitBindExecutionUnit } from './RabbitBindExecutionUnit';

/**
 *
 */
export default class RabbitBindTableHandler extends TableHandlerBaseImpl<RabbitBindContext, RowTypeValue<RabbitBindContext>> {
    /**
     *
     */
    rowType = () => RowTypeValue;

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
            port: 5672,
            vhost: '/'
        },
        preExecution: null,
        execution: null
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RabbitBindContext, RowTypeValue<RabbitBindContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     * rabbit consumer definitions (name, timeout, count, ...)
     */
    addRowDefinition(tableHandler: TableHandler<RabbitBindContext, RowTypeValue<RabbitBindContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'username'),
                defaultValue: '${store?:rabbitmq_username}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('password'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'password'),
                defaultValue: '${store?:rabbitmq_password}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('hostname'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'hostname'),
                defaultValue: '${store?:rabbitmq_hostname}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('vhost'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'vhost'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('port'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'port'),
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
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'queue'),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('exchange'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'exchange'),
                validators: [new UniqueValidator()]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('routing'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>('config', 'routing'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('queue:create'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>(
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
                executionUnit: new PropertySetterExecutionUnit<RabbitBindContext, RowTypeValue<RabbitBindContext>>(
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
    addGroupValidation(tableHandler: TableHandler<RabbitBindContext, RowTypeValue<RabbitBindContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('queue'), Symbol('exchange')]));
    }
}
