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

    /**
     * not all columns are required. Some columns can be optional
     */
    requiredValues = Array<string>();
}
