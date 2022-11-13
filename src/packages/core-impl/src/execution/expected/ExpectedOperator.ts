import { RowValidator } from '@boart/core';
import { NativeType } from 'core/src/data/NativeType';

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
    readonly canCaseInsesitive: boolean;
    check(value: NativeType, expectedValue?: string): ExpectedOperatorResult | Promise<ExpectedOperatorResult>;
}
