import { TableMetaInfo } from './TableMetaInfo';
import { MetaInfo } from './MetaInfo';

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
export function value(required = true, keys: string[] = null) {
    return (target: unknown, propertyKey: string) => {
        keys = !keys ? [propertyKey] : keys;

        const metaTarget: MetaInfo = TableMetaInfo.addMetaInfo(target.constructor);
        metaTarget.values.push(...keys);
        if (required) {
            metaTarget.requiredValues.push(...keys);
        }
    };
}
