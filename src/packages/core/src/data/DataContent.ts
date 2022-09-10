import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContentObject } from './DataContentObject';

/**
 *
 */
export interface DataContent {
    /**
     *
     */
    get type(): ContentInstance;
    /**
     *
     */
    getValue(): ContentType;
    /**
     *
     */
    valueOf(): object | string | number | boolean;
    /**
     *
     */
    getText(): string;
    /**
     *
     */
    toString(): string;
    /**
     *
     */
    toJSON(): string;
    /**
     *
     */
    isObject(): boolean;
    /**
     *
     */
    asDataContentObject(): DataContentObject;
    /**
     *
     */
    isNullOrUndefined(): boolean;
}
