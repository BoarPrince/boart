import { RowValidator } from '../Validators/RowValidator';
import { NativeType } from '../data/NativeType';
import { Descriptionable } from '../description/Descriptionable';

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
