import { DataContent } from '@boart/core';

/**
 *
 */
export interface ExpectedOperator {
    readonly name: string;
    check(value: DataContent, expectedValue: string | number | boolean): boolean;
}
