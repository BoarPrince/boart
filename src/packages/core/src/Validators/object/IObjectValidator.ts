import { IObjectPropertyValidator } from './IObjectPropertyValidator';

/**
 *
 */
export interface IObjectValidator {
    /**
     *
     */
    shouldArray(): IObjectValidator;

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
