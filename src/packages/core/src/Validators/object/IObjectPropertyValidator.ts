import { IObjectValidator } from './IObjectValidator';

/**
 *
 */
export interface IObjectPropertyValidator {
    /**
     *
     */
    shouldArray(): IObjectPropertyValidator;

    /**
     *
     */
    shouldString(): IObjectPropertyValidator;

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