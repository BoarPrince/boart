/**
 *
 */

import { ContentType } from '@boart/core';

export class StepItems {
    private readonly dataContainer = new Map<string, ContentType>();
    public description: string;

    /**
     *
     */
    constructor(public readonly type) {}

    /**
     *
     */
    public addData(key: string, value: ContentType): void {
        if (!value) {
            return;
        }

        if (Array.isArray(value) && value.length === 0) {
            return;
        }

        this.dataContainer.set(key, value);
    }
}
