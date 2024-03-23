import { ValueReplacerHandler } from '../value/ValueReplacerHandler';

import { MarkdownTableReader } from './MarkdownTableReader';
import { RowValue } from './RowValue';
import { MetaInfo } from './MetaInfo';
import { TableRows } from './TableRows';

/**
 *
 */
class CellsIterator {
    private index: number;
    private readonly length: number;

    /**
     *
     */
    constructor(private readonly rows: ReadonlyArray<{ cells: string[] }>) {
        this.index = 0;
        this.length = rows.length;
    }

    /**
     *
     */
    [Symbol.iterator]() {
        return this;
    }

    /**
     *
     */
    private isNextEmptyFirstCell(): boolean {
        if (this.index < this.length) {
            const lookAheadCell = this.rows[this.index].cells[0];
            if (!lookAheadCell || lookAheadCell === '-') {
                return true;
            }
        }

        return false;
    }

    /**
     *
     */
    next(): IteratorResult<string[]> {
        if (this.index < this.length) {
            const cellsCollection = new Array<string[]>();
            cellsCollection.push(this.rows[this.index++].cells);
            while (this.isNextEmptyFirstCell()) {
                cellsCollection.push(this.rows[this.index++].cells);
            }

            const cells = cellsCollection.shift();
            cellsCollection.forEach((c) => {
                if (c[0] === '-') {
                    return;
                }
                c.forEach((cellValue, index) => {
                    if (index !== 0 && !!cellValue) {
                        cells[index] += '\n' + cellValue;
                    }
                });
            });

            return { value: cells, done: false };
        } else {
            return { value: [], done: true };
        }
    }
}

/**
 *
 */
export class RowDataBinder {
    private readonly tableDefinition: TableRows;

    /**
     *
     */
    constructor(
        private readonly tableName: string,
        private readonly columnMetaInfo: MetaInfo,
        tableDefinition: TableRows | string
    ) {
        this.tableDefinition = this.mapTableDefinition(tableDefinition);
    }

    /**
     *
     */
    private mapTableDefinition(tableDefinition: TableRows | string): TableRows {
        if (typeof tableDefinition === 'string') {
            return MarkdownTableReader.convert(tableDefinition);
        } else {
            return tableDefinition;
        }
    }

    /**
     *
     */
    public check(): void {
        if (!this.tableDefinition?.headers) {
            throw Error(`'${this.tableName}': parameter for table handler seems not to be a table`);
        }

        if (!this.tableDefinition.rows || this.tableDefinition.rows.length === 0) {
            throw Error(`'${this.tableName}': at least one row must be defined`);
        }

        if ((this.tableDefinition.headers.cells?.length || 0) < 2) {
            throw Error(`'${this.tableName}': table parameter must have at least a key and one value`);
        }

        const requiredColumnsDefinition = [this.columnMetaInfo?.key || 'no-meta-info'].concat(this.columnMetaInfo?.requiredValues || []);
        const headerCells = this.tableDefinition.headers.cells;

        // check containing columns
        requiredColumnsDefinition
            .filter((col) => !headerCells.includes(col))
            .forEach((col) => {
                throw Error(`'${this.tableName}': missing table definition, column: '${col}'`);
            });

        const allColumnsDefinition = [this.columnMetaInfo?.key || 'no-meta-info'].concat(this.columnMetaInfo?.values || []);

        // check not defined columns
        headerCells //
            .filter((header) => !allColumnsDefinition.includes(header))
            .forEach((col) => {
                throw Error(`column '${col}' is not defined!`);
            });
    }

    /**
     *
     */
    public bind(): ReadonlyArray<RowValue> {
        const headerCells = this.tableDefinition.headers.cells;

        // indexing
        const keyIndex = headerCells.indexOf(this.columnMetaInfo.key);
        const indexNameMapping = new Map<string, number>();

        const metaInfoValues = this.columnMetaInfo.values;
        metaInfoValues.forEach((col) => {
            indexNameMapping.set(col, headerCells.indexOf(col));
        });

        // create rows
        const rows = new Array<RowValue>();
        for (const cells of new CellsIterator(this.tableDefinition.rows)) {
            if (cells[0].startsWith('-')) {
                // it's a comment -> stop processing
                continue;
            }

            const valueEntry: Record<string, string> = {};
            indexNameMapping.forEach((index, columnName) => {
                valueEntry[columnName] = cells[index];
            });

            const valuesReplaced = (o: Record<string, string>, c: string): Record<string, string> => {
                o[c] = ValueReplacerHandler.instance.replace(valueEntry[c]);
                return o;
            };

            rows.push({
                key: cells[keyIndex],
                get values_replaced() {
                    // lazy replace
                    return metaInfoValues.reduce((o, c) => valuesReplaced(o, c), {});
                }
            });
        }

        return rows;
    }
}
