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
    get(key: string): ContentType;

    /**
     *
     */
    set(key: string, value: ContentType);

    /**
     *
     */
    clear();

    /**
     *
     */
    keys(): ReadonlyArray<string>;
}
