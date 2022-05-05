/**
 *
 */
export interface RowValue {
    readonly key: string;
    readonly values: Record<string, string>;
    readonly values_replaced: Record<string, string>;
}
