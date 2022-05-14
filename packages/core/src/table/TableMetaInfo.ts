import { AnyBaseRowType } from './BaseRowType';

/**
 * Meta information defined for the table
 */
export class MetaInfo {
    /**
     * each table has a name
     */
    tableName!: string;
    /**
     * each table has one column that defines the key column
     * e.g.
     *
     * |  *key*   | value1 | value1 |
     * |----------|--------|--------|
     * | expected |        |        |
     *
     */
    key!: string;
    /**
     * beside the key column, other columns are stored in the values array
     */
    values = Array<string>();
}

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
        target._table_meta_info ??= new MetaInfo();
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
