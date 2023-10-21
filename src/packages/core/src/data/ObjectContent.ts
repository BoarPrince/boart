import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import DataContentBase from './DataContentBase';
import { DataContentHelper } from './DataContentHelper';
import { DataContentObject } from './DataContentObject';

/**
 *
 */
export class ObjectContent extends DataContentBase implements DataContentObject {
    private dirty = true;

    /**
     *
     */
    public get type(): ContentInstance {
        return ContentInstance.Object;
    }

    /**
     *
     */
    constructor(protected value?: ContentType) {
        super();

        // check native null and NullContent
        value = value == null || value.toString() == null ? {} : value;
        this.value = this.deepDeconstruct(value);
    }

    /**
     *
     */
    private deepDeconstruct(value: ContentType): ContentType {
        if (value == null) {
            return value;
        } else if (DataContentHelper.isContent(value)) {
            return this.deepDeconstruct((value as DataContent).getValue());
        } else if (typeof value !== 'object') {
            const innerValue = this.tryParse(value.toString(), value);
            // return innerValue;
            return typeof innerValue === 'object' ? innerValue : value;
        } else {
            for (const key of Object.keys(value)) {
                const val = value[key] as ContentType;
                value[key] = this.deepDeconstruct(val);
            }
            return value;
        }
    }

    /**
     *
     */
    toJSON(): string {
        return JSON.stringify(this.getValue());
    }

    /**
     *
     */
    getText(): string {
        if (typeof this.getValue() === 'object') {
            return this.toJSON();
        } else {
            return this.getValue().toString();
        }
    }

    /**
     *
     */
    private transformToArray(value: ContentType): ContentType {
        if (!!value && typeof value === 'object') {
            if (Array.isArray(value)) {
                return value.map((v) => this.transformToArray(v));
            } else {
                const maxIndex: number = Object.keys(value)
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
    getObject(): Record<string, unknown> {
        return this.getValue() as Record<string, unknown>;
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
    get length(): number {
        return typeof this.value === 'string' ? 0 : Object.values(this.value).length;
    }

    /**
     *
     */
    get(key: string | number): ContentType {
        return this.value[key];
    }

    /**
     *
     */
    set(key: string | number, value: ContentType): DataContent {
        this.dirty = true;
        if (!(this.value instanceof Object)) {
            this.value = {};
        }
        this.value[key] = this.deepDeconstruct(value);
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
        return this.value == null;
    }
}
