import { GroupValidator } from './GroupValidator';
import { RowValidator } from './RowValidator';
import { ValidatorType } from './ValidatorType';

/**
 *
 */
export interface ValidatorFactory {
    readonly name: string;
    type: ValidatorType;
    check(para: string | Array<unknown> | object): boolean;
    create(para: string | Array<unknown> | object): RowValidator | GroupValidator;
}
