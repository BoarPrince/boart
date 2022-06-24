import { DataContent } from '@boart/core';

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
    check(value: DataContent, expectedValue?: string): ExpectedOperatorResult | Promise<ExpectedOperatorResult>;
}
