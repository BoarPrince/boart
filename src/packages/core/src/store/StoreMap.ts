import { ContentType } from '../data/ContentType';

export interface StoreMap {
    put(key: string, value: ContentType): void;
    get(key: string | undefined): ContentType;
    clear(): void;
}
