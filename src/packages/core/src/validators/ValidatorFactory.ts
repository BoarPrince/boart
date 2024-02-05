import { GroupValidator } from './GroupValidator';
import { RowValidator } from './RowValidator';

/**
 *
 */
export interface ValidatorFactory {
    readonly name: string;
    check(para: string | Array<unknown> | object): boolean;
    create(para: string | Array<unknown> | object): RowValidator | GroupValidator;
}
