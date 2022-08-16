import { DataContent, RowValidator } from '@boart/core';

/**
 *
 */
export interface ExpectedOperatorResult {
    result: boolean;
    errorMessage?: string;
}

/**
 *
 */
export interface ExpectedOperator {
    readonly name: string;
    readonly validators?: Array<RowValidator>;
    check(value: DataContent, expectedValue?: string): ExpectedOperatorResult | Promise<ExpectedOperatorResult>;
}
