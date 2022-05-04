import { MetaInfo, TableMetaInfo } from './TableMetaInfo';

/**
 *
 */
export function key() {
    return (target: unknown, propertyKey: string) => {
        const metaTarget: MetaInfo = TableMetaInfo.addMetaInfo(target.constructor);
        metaTarget.key = propertyKey;
    };
}

/**
 *
 */
export function value() {
    return (target: unknown, propertyKey: string) => {
        const metaTarget: MetaInfo = TableMetaInfo.addMetaInfo(target.constructor);
        metaTarget.values.push(propertyKey);
    };
}
