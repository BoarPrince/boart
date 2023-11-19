import { ContentType } from '../data/ContentType';
import { ValueReplaceArg } from '../value/ValueReplacer';

/**
 *
 */
export abstract class StoreMap {
    abstract put(ast: ValueReplaceArg | any, value: ContentType): void;
    abstract get(ast: ValueReplaceArg | any | undefined): ContentType;
    abstract has(ast: ValueReplaceArg): boolean;
    abstract clear(): void;

    /**
     *
     */
    protected getKey(ast: ValueReplaceArg): string {
        const storeName = ast?.qualifier?.value;
        if (!storeName) {
            throw Error('qualifier must be defined for identifying the store name');
        }
        return storeName;
    }

    /**
     *
     */
    public static getStoreIdentifier(name: string): ValueReplaceArg {
        return {
            qualifier: {
                value: name,
                paras: [],
                stringValue: name
            },
            match: name
        };
    }
}
