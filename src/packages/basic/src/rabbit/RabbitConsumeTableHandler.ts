import { GroupRowDefinition, RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { PropertySetterExecutionUnit, RequiredValidator, RowTypeValue } from '@boart/core-impl';

import { RabbitConsumeContext } from './RabbitConsumeContext';
import { RabbitConsumeExecutionUnit } from './RabbitConsumeExecutionUnit';

/**
 *
 */
export default class RabbitConsumeTableHandler extends TableHandlerBaseImpl<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>> {
    /**
     *
     */
    rowType = () => RowTypeValue;

    /**
     *
     */
    mainExecutionUnit = () => new RabbitConsumeExecutionUnit();

    /**
     *
     */
    newContext = (): RabbitConsumeContext => ({
        config: {
            name: '',
            timeout: 10,
            messageCount: 1
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
    addGroupRowDefinition(tableHandler: TableHandler<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('name'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>>('config', 'name'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('timeout'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>>(
                    'config',
                    'timeout'
                ),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('count'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>>(
                    'config',
                    'messageCount'
                ),
                validators: null
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<RabbitConsumeContext, RowTypeValue<RabbitConsumeContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('name')]));
    }
}
