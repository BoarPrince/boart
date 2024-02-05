import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';

/**
 *
 */
export interface IBaseValidator {
    /**
     *
     */
    path(): Array<string>;

    /**
     *
     */
    prop(propName: string): IObjectPropertyValidator;

    /**
     *
     */
    parent(): IObjectValidator;

    /**
     *
     */
    readonly type: 'object' | 'prop';
}
