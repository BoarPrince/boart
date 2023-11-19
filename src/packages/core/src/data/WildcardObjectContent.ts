import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentHelper } from './DataContentHelper';
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
    constructor(value: Array<unknown> = []) {
        super(value);
    }

    /**
     *
     */
    has(key: string): boolean {
        const valueAsArray = this.value.valueOf() as Array<unknown>;
        return valueAsArray.map((v) => v[key]).some((v) => !!v);
    }

    /**
     *
     */
    get(key: string): ContentType {
        if (!this.has(key)) {
            return null;
        }

        const valueAsArray = this.value.valueOf() as Array<unknown>;

        const collected = new Array<unknown>();
        valueAsArray
            .map((v) => v[key]) //
            .filter((value) => value !== undefined)
            .forEach((value) => {
                if (Array.isArray(value)) {
                    value.forEach((elements) => {
                        collected.push(elements);
                    });
                } else {
                    collected.push(value);
                }
            });

        return collected.length <= 1 ? DataContentHelper.create(collected) : new ObjectContent(collected);
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
