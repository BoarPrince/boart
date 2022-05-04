 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BooleanSupportOption } from 'prettier';

import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import DataContentBase from './DataContentBase';

/**
 *
 */

export class NativeContent extends DataContentBase implements DataContent {
    private readonly value: number | string | BooleanSupportOption;

    /**
     *
     */
    readonly type = ContentInstance.Native;

    /**
     *
     */
    constructor(value: any) {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.value = value;
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
