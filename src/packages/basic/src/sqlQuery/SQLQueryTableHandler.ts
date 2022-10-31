import { GroupRowDefinition, RowDefinition, TableHandler, TableHandlerBaseImpl, TableRowType } from '@boart/core';
import { PropertySetterExecutionUnit, RequiredValidator, RowTypeValue, UniqueValidator } from '@boart/core-impl';

import { SQLQueryContext } from './SQLQueryContext';
import { SQLQueryExecutionUnit } from './SQLQueryExecutionUnit';

/**
 *
 */
export default class SQLQueryTableHandler extends TableHandlerBaseImpl<SQLQueryContext, RowTypeValue<SQLQueryContext>> {
    /**
     *
     */
    rowType = () => RowTypeValue;

    /**
     *
     */
    mainExecutionUnit = () => new SQLQueryExecutionUnit();

    /**
     *
     */
    newContext = (): SQLQueryContext => ({
        config: {
            type: 'mssql',
            username: '',
            password: '',
            hostname: ''
        },
        preExecution: {
            database: '',
            query: ''
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
    addGroupRowDefinition(tableHandler: TableHandler<SQLQueryContext, RowTypeValue<SQLQueryContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<SQLQueryContext, RowTypeValue<SQLQueryContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit('config', 'username'),
                defaultValue: '${env?:mssql_username}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('password'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit('config', 'password'),
                defaultValue: '${env?:mssql_password}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('hostname'),
                type: TableRowType.Configuration,
                executionUnit: new PropertySetterExecutionUnit('config', 'hostname'),
                defaultValue: '${env?:mssql_hostname}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        /**
         * runtime
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('database'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit('preExecution', 'database'),
                validators: [new UniqueValidator()]
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('query'),
                type: TableRowType.PreProcessing,
                executionUnit: new PropertySetterExecutionUnit('preExecution', 'query'),
                validators: [new UniqueValidator()]
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<SQLQueryContext, RowTypeValue<SQLQueryContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('database')]));
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('query')]));
    }
}
