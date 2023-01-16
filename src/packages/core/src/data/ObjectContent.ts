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
    readonly type = ContentInstance.Object;

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
    get(key: string): ContentType {
        if (key === '*') {
            return !Array.isArray(this.value) ? null : new WildcardObjectContent(this.value);
        } else {
            return this.value[key];
        }
    }

    /**
     *
     */
    set(key: string, value: ContentType): DataContent {
        this.dirty = true;
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

/**
 *
 */
class WildcardObjectContent extends ObjectContent {
    /**
     *
     */
    // constructor(value: Array<string | boolean | number | object | DataContent>) {
    constructor(value: ContentType) {
        super(value);
    }

    /**
     *
     */
    has(key: string): boolean {
        return Object.values(this.value).some((v) => !!v[key]);
    }

    /**
     *
     */
    get(key: string): ContentType {
        if (key == '*') {
            return new WildcardObjectContent(this.value);
        }

        if (!this.has(key)) {
            return null;
        }

        const collectedValue = this.value as Array<unknown>;

        const collected = new Array<unknown>();
        collectedValue.forEach((v) => {
            if (Array.isArray(v[key])) {
                (v[key] as Array<unknown>)?.forEach((elements) => collected.push(elements));
            } else {
                collected.push(v[key]);
            }
        });

        return new WildcardObjectContent(collected);
    }

    /**
     *
     */
    set(key: string, value: ContentType): DataContent {
        Object.values(this.value).forEach((v) => {
            v[key] = value;
        });
        return this;
    }
}
