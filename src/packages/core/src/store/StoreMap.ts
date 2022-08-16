import { DataContent } from '../data/DataContent';

export interface StoreMap {
    put(key: string, value: DataContent): void;
    get(key: string | undefined): DataContent;
    clear(): void;
}
