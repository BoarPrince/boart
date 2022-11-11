import sql, { config, ConnectionPool, Request } from 'mssql';

import { MSSQLQueryResult } from './MSSQLQueryResult';

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
    async query(queryStr: string): Promise<MSSQLQueryResult> {
        const pool = await this.connect();
        try {
            const request = new Request();
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
