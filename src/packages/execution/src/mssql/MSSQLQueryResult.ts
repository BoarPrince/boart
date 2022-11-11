import { ContentType } from '@boart/core';
import { IResult } from 'mssql';

/**
 *
 */
export class MSSQLQueryResult {
    /**
     *
     */
    constructor(private result: IResult<unknown>) {}

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
    get affectedRows(): number[] {
        return this.result.rowsAffected;
    }

    /**
     *
     */
    get rowCount(): number {
        // const result = this._result.recordset[0];
        return this.result.recordset.length;
    }
}
