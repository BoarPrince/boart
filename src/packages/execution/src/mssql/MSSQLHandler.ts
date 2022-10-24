import { ContentType } from '@boart/core';
import sql, { config, ConnectionPool, IResult } from 'mssql';

/**
 *
 */
export class MSSQLQueryResult {
    /**
     *
     */
    constructor(public result: IResult<unknown>) {}

    /**
     *
     */
    getStringOrObjectArray(): ContentType {
        if (!this.result.recordset) {
            // update
            return this.result.rowsAffected;
        } else {
            // select
            const columns = Object.keys(this.result.recordset.columns);
            const result = this.result.recordset.length === 1 ? (this.result.recordset[0] as ContentType) : this.result.recordset;
            return columns.length === 1 ? result[columns[0]] : result;
        }
    }

    /**
     *
     */
    get affectedRows() {
        return this.result.rowsAffected;
    }

    /**
     *
     */
    get rowCount() {
        // const result = this._result.recordset[0];
        return this.result.recordset.length;
    }
}

/**
 * https://github.com/tediousjs/node-mssql
 */
export class MSSQLHandler {
    private isConnected: boolean;
    private config: config;

    /**
     *
     */
    constructor(database: string, server: string, user: string, password: string) {
        this.isConnected = false;
        this.config = {
            user,
            password,
            server,
            database,
            options: {
                enableArithAbort: true,
                encrypt: false
            }
        };
    }

    /**
     *
     */
    private async connect(): Promise<ConnectionPool> {
        if (this.isConnected === true) {
            return;
        }
        this.isConnected = true;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return await sql.connect(this.config);
    }

    /**
     *
     */
    async query(queryStr): Promise<MSSQLQueryResult> {
        const pool = await this.connect();
        try {
            const request = new sql.Request();
            const result = await request.query(queryStr);
            return new MSSQLQueryResult(result);
        } finally {
            await pool.close();
        }
    }

    /**
     *
     */
    async close() {
        // await sql.close();
    }
}
