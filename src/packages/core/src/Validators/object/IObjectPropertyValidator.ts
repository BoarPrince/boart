import { IObjectValidator } from './IObjectValidator';

/**
 *
 */
export interface IObjectPropertyValidator {
    /**
     *
     */
    shouldArray(type?: 'string' | 'boolean' | 'unknown'): IObjectPropertyValidator;

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
    shouldHaveValueOf(...values: string[]): IObjectPropertyValidator;

    /**
     *
     */
    parent(): IObjectValidator;

    /**
     *
     */
    prop(propName: string): IObjectPropertyValidator;

    /**
     *
     */
    object(): IObjectValidator;
}
