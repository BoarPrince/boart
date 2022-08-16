import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import DataContentBase from './DataContentBase';

/**
 *
 */

export class NativeContent extends DataContentBase implements DataContent {
    private readonly value: number | string | boolean | object;

    /**
     *
     */
    readonly type = ContentInstance.Native;

    /**
     *
     */
    constructor(value?: number | boolean | object | null) {
        super();
        this.value = value;
    }

    /**
     *
     */
    toJSON(): string {
        return this.value as string;
    }

    /**
     *
     */
    getText(): string {
        return this.value?.toString();
    }

    /**
     *
     */
    getValue(): ContentType {
        return this.value;
    }
}
