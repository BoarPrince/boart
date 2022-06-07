import { ExecutionContext } from '../execution/ExecutionContext';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';

import { BaseRowMetaDefinition } from './BaseRowMetaDefinition';
import { BaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';
import { RowValue } from './RowValue';
import { MetaInfo } from './TableMetaInfo';

/**
 *
 */
interface RowDef<TExecutionContext extends ExecutionContext<object, object, object>, TRowType extends BaseRowType<TExecutionContext>> {
    key: string;
    para: string;
    selector: string;
    definition: RowDefinition<TExecutionContext, TRowType>;
}

/**
 * Binds the row definitions to the meta defintions of each row
 */
export class RowDefinitionBinder<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    /**
     *
     */
    constructor(
        private readonly tableName: string,
        private readonly columnMetaInfo: MetaInfo,
        private readonly rowDefinitions: ReadonlyArray<RowDefinition<TExecutionContext, TRowType>>,
        private readonly rowsWithValues: ReadonlyArray<RowValue>
    ) {}

    /**
     *
     */
    bind(type: new (def: BaseRowMetaDefinition<TExecutionContext, TRowType>) => TRowType): Array<TRowType> {
        return this.rowsWithValues?.map((row) => {
            const rowDef = {
                key: '',
                para: null,
                selector: null,
                definition: null
            } as RowDef<TExecutionContext, TRowType>;

            const definitions = this.rowDefinitions
                .map((definition) => {
                    const parts = row.key.split('#');
                    const rowKey = parts.shift();
                    const rowSelector = parts.join('#') || null;
                    return { rowKey, rowSelector, key: definition.key.description, definition };
                })
                // longest key first, because longer key must match first
                .sort((def1, def2) => def2.key.length - def1.key.length);

            // Prioritize definitions without parameter higher
            for (const def of definitions) {
                rowDef.selector = def.rowSelector;
                rowDef.definition = def.definition;

                if (def.key === def.rowKey) {
                    rowDef.key = def.key;
                    break;
                }
            }

            if (!rowDef.key) {
                // if not match found without parameter, check matching with parameters
                for (const def of definitions) {
                    const defKey = def.key || '';
                    if (def.rowKey.startsWith(`${defKey}:`)) {
                        rowDef.key = def.key;
                        rowDef.para = def.rowKey.replace(`${defKey}:`, '');
                        rowDef.definition = def.definition;
                        break;
                    }
                }
            }

            // checks if the binding could be fullfilled
            this.checkBinding(row, rowDef);

            const rows = new type({
                _metaDefinition: rowDef.definition,
                key: rowDef.key,
                keyPara: rowDef.para,
                selector: rowDef.selector,
                values: row.values,
                values_replaced: row.values_replaced
            });

            return this.bindDefaultValues(rows);
        });
    }

    /**
     * checks the correct binding  result
     */
    private checkBinding(row: RowValue, rowDef: RowDef<TExecutionContext, TRowType>): void {
        const throwIf = (condition: boolean, errorMessage: string): void => {
            if (condition) {
                throw Error(errorMessage);
            }
        };

        if (!rowDef.key) {
            throw Error(`'${this.tableName}': key '${row.key}' is not valid`);
        }

        switch (rowDef.definition.parameterType) {
            case ParaType.True:
                throwIf(!rowDef.para, `'${this.tableName}': key '${row.key}' must have a parameter!`);
                break;
            case ParaType.Optional:
                break;
            case ParaType.False:
                throwIf(
                    !!rowDef.para,
                    `'${this.tableName}': key '${row.key}' with definition '${rowDef.key}' cannot have a parameter: '${rowDef.para}'!`
                );
                break;
        }

        switch (rowDef.definition.selectorType) {
            case SelectorType.True:
                throwIf(!rowDef.selector, `'${this.tableName}': key '${row.key}' must have a selector!`);
                break;
            case SelectorType.Optional:
                break;
            case SelectorType.False:
                throwIf(!!rowDef.selector, `'${this.tableName}': key '${row.key}' cannot have a selector: '${rowDef.selector}'!`);
                break;
        }
    }

    /**
     *
     */
    private bindDefaultValues(row: TRowType): TRowType {
        const colName = row.data._metaDefinition.defaultValueColumn?.description;
        if (!colName) {
            return row;
        }

        if (!this.columnMetaInfo.values.includes(colName)) {
            throw Error(`'${this.tableName}': default column name '${colName}' does not exists`);
        }

        if (!row.data.values[colName]) {
            row.data.values[colName] = row.data._metaDefinition.defaultValue;
            row.data.values_replaced[colName] = row.data._metaDefinition.defaultValue;
        }
        return row;
    }
}
