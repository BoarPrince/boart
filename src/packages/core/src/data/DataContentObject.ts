import { ContentType } from './ContentType';

/**
 *
 */
export interface DataContentObject {
    /**
     *
     */
    has(key: string): boolean;
    /**
     *
     */
    get(key: string | number): ContentType;
    /**
     *
     */
    set(key: string | number, value: ContentType): ContentType;
    /**
     *
     */
    get length(): number;
    /**
     *
     */
    clear();
    /**
     *
     */
    keys(): ReadonlyArray<string>;
    /**
     *
     */
    getValue(): ContentType;
    /**
     *
     */
    isObject(): boolean;
    /**
     *
     */
    valueOf(): object | string | number | boolean;
}
