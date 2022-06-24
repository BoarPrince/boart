import { DataContent } from './DataContent';

/**
 *
 */
export type ContentType =
    | ReadonlyArray<string | boolean | number | object | DataContent>
    | Array<string | boolean | number | object | DataContent>
    | string
    | boolean
    | number
    | object
    | DataContent;
