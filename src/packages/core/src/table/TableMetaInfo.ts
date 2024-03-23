import { AnyBaseRowType } from './BaseRowType';
import { MetaInfo } from './MetaInfo';

/**
 *
 */
export class TableMetaInfo {
    // private _table_meta_info: MetaInfo;

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static readonly addMetaInfo = (target: any): MetaInfo => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        target._table_meta_info = target._table_meta_info || new MetaInfo();
        return target._table_meta_info;
    };

    /**
     *
     */
    static get<T extends AnyBaseRowType>(type: new (BaseTableRowMetaDefinition) => T): MetaInfo {
        const rowSample = new type(null);
        return TableMetaInfo.getByInstance(rowSample);
    }

    /**
     *
     */
    static getByInstance<T extends AnyBaseRowType>(instance: T): MetaInfo {
        const metaInfo = TableMetaInfo.addMetaInfo(instance.constructor);
        if (!metaInfo.key) {
            throw Error(`key is not defined for table definition '${instance.constructor.name}'`);
        }
        if (!metaInfo.values || metaInfo.values.length === 0) {
            throw Error(`no value defined for table definition '${instance.constructor.name}'`);
        }
        return metaInfo;
    }
}
