import {
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    GroupRowDefinition,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType
} from '@boart/core';
import { RequiredValidator, UniqueValidator } from '@boart/core-impl';

import { SQLQueryContext } from './SQLQueryContext';
import { SQLQueryExecutionUnit } from './SQLQueryExecutionUnit';

/**
 *
 */
export default class SQLQueryTableHandler extends TableHandlerBaseImpl<SQLQueryContext, DefaultRowType<SQLQueryContext>> {
    /**
     *
     */
    rowType = () => DefaultRowType;

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
    addGroupRowDefinition(tableHandler: TableHandler<SQLQueryContext, DefaultRowType<SQLQueryContext>>) {
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-group-definition'));
        tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance('basic-data'));
    }

    /**
     *
     */
    addRowDefinition(tableHandler: TableHandler<SQLQueryContext, DefaultRowType<SQLQueryContext>>) {
        /**
         * Credentials
         */
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('username'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'username'),
                defaultValue: '${env?:mssql_username}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('password'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'password'),
                defaultValue: '${env?:mssql_password}',
                defaultValueColumn: Symbol('value'),
                validators: null
            })
        );

        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('hostname'),
                type: TableRowType.Configuration,
                executionUnit: new DefaultPropertySetterExecutionUnit('config', 'hostname'),
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
                executionUnit: new DefaultPropertySetterExecutionUnit('preExecution', 'database'),
                validators: [new UniqueValidator()]
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('query'),
                type: TableRowType.PreProcessing,
                executionUnit: new DefaultPropertySetterExecutionUnit('preExecution', 'query'),
                validators: [new UniqueValidator()]
            })
        );
    }

    /**
     *
     */
    addGroupValidation(tableHandler: TableHandler<SQLQueryContext, DefaultRowType<SQLQueryContext>>) {
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('database')]));
        tableHandler.addGroupValidator(new RequiredValidator([Symbol('query')]));
    }
}
