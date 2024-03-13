import {
    DataContentHelper,
    DefaultRowType,
    ExecutionUnit,
    NativeContent,
    ObjectContent,
    StepReport,
    TextContent,
    Timer
} from '@boart/core';
import { MSSQLHandler, MSSQLQueryResult } from '@boart/execution';

import { SQLQueryContext } from './SQLQueryContext';

/**
 *
 */
export class SQLQueryExecutionUnit implements ExecutionUnit<SQLQueryContext, DefaultRowType<SQLQueryContext>> {
    readonly key = Symbol('rest call - main');
    readonly description = () => ({
        id: '77bc07bf-4a06-453e-8367-e8009cfa8fe7',
        description: '',
        examples: null
    });

    /**
     *
     */
    private parseJSON(data: string): object {
        try {
            const parsedData = JSON.parse(data) as object;
            return typeof parsedData === 'object' ? parsedData : null;
        } catch (_) {
            return null;
        }
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: SQLQueryContext, _row: DefaultRowType<SQLQueryContext>): Promise<void> {
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        const header = DataContentHelper.create(context.execution.header);
        context.execution.header = header;
        header.asDataContentObject().set('rows', result.affectedRows[0]);

        const resultValue = result.getStringOrObjectArray();
        if (typeof resultValue === 'string') {
            const jsonResult = this.parseJSON(resultValue);
            if (jsonResult) {
                context.execution.data = new ObjectContent(
                    Array.isArray(jsonResult) && jsonResult.length === 1 ? (jsonResult[0] as object) : jsonResult
                );
            } else {
                context.execution.data = new TextContent(resultValue);
            }
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
