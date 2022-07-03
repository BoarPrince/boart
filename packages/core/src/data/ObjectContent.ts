import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import DataContentBase from './DataContentBase';
import { DataContentObject } from './DataContentObject';

/**
 *
 */

export class ObjectContent extends DataContentBase implements DataContentObject {
    private value: ContentType;
    private dirty = true;

    /**
     *
     */
    readonly type = ContentInstance.Object;

    /**
     *
     */
    constructor(value?: ContentType) {
        super();

        // check native null and NullContent
        value = value == null || value.toString() == null ? {} : value;
        if (typeof value !== 'object') {
            this.value = this.tryParse(value.toString(), value);
        } else {
            this.value = value;
        }
    }

    /**
     *
     */
    toJSON(): string {
        return JSON.stringify(this.getValue(), (_key: string, value: string | unknown) => {
            if (typeof value === 'string') {
                return this.tryParse(value, value);
            } else {
                return value;
            }
        });
    }

    /**
     *
     */
    getText(): string {
        return this.toJSON();
    }

    /**
     *
     */
    private transformToArray(value: ContentType): ContentType {
        if (!!value && typeof value === 'object') {
            if (Array.isArray(value)) {
                return value.map((v) => this.transformToArray(v));
            } else {
                const maxIndex = Object.keys(value)
                    .map((k) => Number.parseInt(k))
                    .sort((a, b) => a - b)
                    .pop();

                if (isNaN(maxIndex)) {
                    Object.keys(value).forEach((k) => {
                        value[k] = this.transformToArray(value[k] as object);
                    });
                    return value;
                } else {
                    const array = new Array(maxIndex + 1);
                    Object.keys(value).forEach((k) => {
                        array[Number.parseInt(k)] = this.transformToArray(value[k] as object);
                    });
                    return array;
                }
            }
        } else {
            return value;
        }
    }

    /**
     *
     */
    getValue(): ContentType {
        if (this.dirty) {
            this.value = this.transformToArray(this.value);
            this.dirty = false;
        }
        return this.value;
    }

    /**
     *
     */
    isObject() {
        return true;
    }

    /**
     *
     */
    asDataContentObject(): DataContentObject {
        return this;
    }

    /**
     *
     */
    has(key: string): boolean {
        return Object.keys(this.value).includes(key);
    }

    /**
     *
     */
    get(key: string): ContentType {
        return this.value[key];
    }

    /**
     *
     */
    set(key: string, value: ContentType): DataContent {
        this.dirty = true;
        this.value[key] = value;
        return this;
    }

    /**
     *
     */
    keys(): ReadonlyArray<string> {
        return Object.keys(this.value);
    }

    /**
     *
     */
    clear() {
        this.dirty = true;
        this.value = {};
    }

    /**
     *
     */
    isNullOrUndefined() {
        return Object.keys(this.value).length === 0;
    }
}
