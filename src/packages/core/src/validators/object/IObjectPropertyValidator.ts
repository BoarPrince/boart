import { IObjectValidator } from './IObjectValidator';
import { IBaseValidator } from './IBaseValidator';

/**
 *
 */
export interface IObjectPropertyValidator extends IBaseValidator {
    /**
     *
     */
    shouldArray(type?: 'string' | 'boolean' | 'unknown' | 'object'): IObjectPropertyValidator;

    /**
     *
     */
    shouldString(): IObjectPropertyValidator;

    /**
     *
     */
    shouldBoolean(): IObjectPropertyValidator;

    /**
     *
     */
    shouldObject(): IObjectPropertyValidator;

    /**
     *
     */
    shouldObjectOrFunction(): IObjectPropertyValidator;

    /**
     *
     */
    shouldHaveValueOf(...values: string[]): IObjectPropertyValidator;

    /**
     *
     */
    default(value: unknown): IObjectPropertyValidator;

    /**
     *
     */
    child(): IObjectValidator;
}
