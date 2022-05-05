/**
 *
 */

export interface TableRows {
    readonly headers: {
        readonly cells: readonly string[];
    };
    rows: Array<{
        cells: string[];
    }>;
}
