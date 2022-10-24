import { ExecutionUnit, NativeContent, ObjectContent, TextContent, Timer } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { MSSQLHandler, MSSQLQueryResult } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { SQLQueryContext } from './SQLQueryContext';

/**
 *
 */
export class SQLQueryExecutionUnit implements ExecutionUnit<SQLQueryContext, RowTypeValue<SQLQueryContext>> {
    public description = 'rest call - main';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: SQLQueryContext, _row: RowTypeValue<SQLQueryContext>): Promise<void> {
        //#region rest call executing
        const timer = new Timer();
        const query = context.preExecution.query;
        const database = context.preExecution.database;

        StepReport.instance.type = 'mssqlQuery';

        const sql = new MSSQLHandler(database, context.config.hostname, context.config.username, context.config.password);
        let result: MSSQLQueryResult;
        try {
            result = await sql.query(query);
        } catch (error) {
            context.execution.data = new TextContent(error.message as string);
            throw error;
        } finally {
            StepReport.instance.addInputItem('SQL Query (query)', 'text', query);
            context.execution.header = new ObjectContent({
                hostname: context.config.hostname,
                database,
                type: context.config.type,
                duration: timer.stop().duration
            });
        }
        //#endregion

        //#region setting result to context
        context.execution.header.asDataContentObject().set('rows', result.result.rowsAffected[0]);

        const resultValue = result.getStringOrObjectArray();
        if (typeof resultValue === 'string') {
            context.execution.data = new TextContent(resultValue);
        } else if (typeof resultValue === 'boolean') {
            context.execution.data = new NativeContent(resultValue);
        } else if (typeof resultValue === 'number') {
            context.execution.data = new NativeContent(resultValue);
        } else {
            context.execution.data = new ObjectContent(resultValue);
        }
        //#endregion

        StepReport.instance.addResultItem('SQL Query result (header)', 'json', context.execution.header);
        StepReport.instance.addResultItem('SQL Query result (paylaod)', 'json', context.execution.data);
    }
}