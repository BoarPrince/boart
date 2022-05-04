import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentObject } from './DataContentObject';

/**
 *
 */

export class NullContent implements DataContent {
    readonly type = ContentInstance.Null;

    getValue(): ContentType {
        return null;
    }
    getText(): string {
        return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(_key: string): DataContent {
        return this;
    }
    toString(): string {
        return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    split(_seperator: string): readonly string[] {
        return [];
    }
    toJSON(): string {
        return '';
    }
    isObject(): boolean {
        return false;
    }
    asDataContentObject(): DataContentObject {
        return null;
    }
    isNullOrUndefined(): boolean {
        return true;
    }
}
