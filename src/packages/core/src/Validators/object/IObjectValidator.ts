import { IBaseValidator } from './IBaseValidator';

/**
 *
 */
export interface IObjectValidator extends IBaseValidator {
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
    onlyContainsProperties(props: Array<string>, optionalProps?: Array<string>): IObjectValidator;
}
