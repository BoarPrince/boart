import { RowValidator } from '@boart/core';
import { NativeType } from 'core/src/data/NativeType';
import { Descriptionable } from 'core/src/documentation/Descriptionable';

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
export interface ExpectedOperator extends Descriptionable {
    readonly name: string;
    readonly validators?: Array<RowValidator>;
    readonly canCaseInsesitive: boolean;
    check(value: NativeType, expectedValue?: string): ExpectedOperatorResult | Promise<ExpectedOperatorResult>;
}
