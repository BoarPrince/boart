import { IObjectPropertyValidator } from './IObjectPropertyValidator';

/**
 *
 */
export interface IObjectValidator {
    /**
     *
     */
    shouldArray(type?: 'string' | 'boolean' | 'unknown'): IObjectValidator;

    /**
     *
     */
    shouldObject(): IObjectValidator;

    /**
     *
     */
    shouldString(): IObjectValidator;

    /**
     *
     */
    notNull(): IObjectValidator;

    /**
     *
     */
    containsProperties(props: Array<string>): IObjectValidator;

    /**
     *
     */
    containsPropertiesOnly(props: Array<string>, optionalProps?: Array<string>): IObjectValidator;

    /**
     *
     */
    prop(prop: string): IObjectPropertyValidator;
}
