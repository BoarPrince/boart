import {
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    GroupRowDefinition,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import { ExpectedDataExecutinoUnit, ExpectedJsonLogicExecutionUnit, RequiredValidator } from '@boart/core-impl';
import { IntValidator } from '@boart/core-impl';

import { RabbitConsumeContext } from './RabbitConsumeContext';
import { RabbitConsumeExecutionUnit } from './RabbitConsumeExecutionUnit';

/**
 *
 */
export default class RabbitConsumeTableHandler extends TableHandlerBaseImpl<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>> {
    /**
     *
     */
    rowType = () => DefaultRowType;

    /**
     *
     */
    mainExecutionUnit = () => new RabbitConsumeExecutionUnit();

    /**
     *
     */
    newContext = (): RabbitConsumeContext => ({
        config: {
            queue: '',
            timeout: 10,
            count_min: 1,
            count_max: null,
            username: '',
            password: '',
            hostname: '',
            port: 5672,
            vhost: '/'
        },

        preExecution: null,
        execution: {
            data: null,
            transformed: null,
            header: null,
            filter: {
                data: null,
                header: null
            }
        }
    });

    /**
     *
     */
    addGroupRowDefinition(tableHandler: TableHandler<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     * rabbit consumer definitions (name, timeout, count, ...)
     */
    addRowDefinition(tableHandler: TableHandler<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
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
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
                    'config',
                    'queue'
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('timeout'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
                    'config',
                    'timeout'
                ),
                validators: [new IntValidator('value')]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('count'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
                    'config',
                    'count_min'
                ),
                validators: [new IntValidator('value', true)]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('count:min'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
                    'config',
                    'count_min'
                ),
                validators: [new IntValidator('value', true)]
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('count:max'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>(
                    'config',
                    'count_max'
                ),
                validators: [new IntValidator('value', true)]
            })
        );

        /**
         * message filters (expected)
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('filter:expected'),
                type: TableRowType.InProcessing,
                executionUnit: new ExpectedDataExecutinoUnit(),
                validators: null
            })
        );

        /**
         * message filters (jsonLogic)
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('filter:jsonLogic'),
                type: TableRowType.InProcessing,
                executionUnit: new ExpectedJsonLogicExecutionUnit(),
                validators: null
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RabbitConsumeContext, DefaultRowType<RabbitConsumeContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('queue')]));
    }
}
