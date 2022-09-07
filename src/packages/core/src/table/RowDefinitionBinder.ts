import { ExecutionContext } from '../execution/ExecutionContext';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { ValueReplacerHandler } from '../value/ValueReplacerHandler';

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
    private bindDefaultValues(): ReadonlyArray<RowValue> {
        // check if default column is correct
        this.rowDefinitions //
            ?.map((rowDef) => rowDef.defaultValueColumn?.description || '')
            .filter((colName) => !!colName)
            .filter((colName) => !this.columnMetaInfo.values.includes(colName))
            .forEach((colName) => {
                throw Error(`'${this.tableName}': default column name '${colName}' does not exists`);
            });

        // add default rows, if the row does not exists.
        return this.rowDefinitions
            ?.filter(
                (row) =>
                    !!row.defaultValue &&
                    !this.rowsWithValues.find(
                        (rowWithValue) =>
                            rowWithValue.key === row.key.description || //
                            rowWithValue.key.startsWith(row.key.description || '' + ':')
                    )
            )
            .map((row) => {
                const column = row.defaultValueColumn.description;
                const value = (
                    typeof row.defaultValue === 'function' ? row.defaultValue(this.rowsWithValues) : row.defaultValue
                )?.toString();

                const values = {} as Record<string, string>;
                values[column] = value;

                const valuesReplaced = {} as Record<string, string>;
                valuesReplaced[column] = ValueReplacerHandler.instance.replace(value);

                return {
                    key: row.key.description,
                    values,
                    values_replaced: valuesReplaced
                } as RowValue;
            })
            .concat(this.rowsWithValues);
    }

    /**
     *
     */
    bind(type: new (def: BaseRowMetaDefinition<TExecutionContext, TRowType>) => TRowType): Array<TRowType> {
        const rows = this.bindDefaultValues();

        return rows?.map((row) => {
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

            return new type({
                _metaDefinition: rowDef.definition,
                key: rowDef.key,
                keyPara: rowDef.para,
                selector: rowDef.selector,
                values: row.values,
                values_replaced: row.values_replaced
            });
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
}
