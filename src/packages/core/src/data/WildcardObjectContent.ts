import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { ObjectContent } from './ObjectContent';

/**
 *
 */
export class WildcardObjectContent extends ObjectContent {
    /**
     *
     */
    public get type(): ContentInstance {
        return ContentInstance.WildcardObject;
    }

    /**
     *
     */
    // constructor(value: Array<string | boolean | number | object | DataContent>) {
    constructor(value: Array<unknown> = []) {
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
