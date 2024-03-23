import { ExecutionContext } from '../execution/ExecutionContext';
import { VariableParser } from '../parser/VariableParser';
import { ASTAction } from '../parser/ast/ASTAction';
import { ParaType } from '../types/ParaType';
import { ScopedType } from '../types/ScopedType';
import { SelectorType } from '../types/SelectorType';
import { ValueReplacerHandler } from '../value/ValueReplacerHandler';

import { BaseRowMetaDefinition } from './BaseRowMetaDefinition';
import { BaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';
import { RowValue } from './RowValue';
import { MetaInfo } from './MetaInfo';

/**
 *
 */
interface RowValueWithAst extends RowValue {
    ast: ASTAction;
}

/**
 * Binds the row definitions to the meta defintions of each row
 */
export class RowDefinitionBinder<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    private parser: VariableParser;

    /**
     *
     */
    constructor(
        private readonly tableName: string,
        private readonly columnMetaInfo: MetaInfo,
        private readonly rowDefinitions: ReadonlyArray<RowDefinition<TExecutionContext, TRowType>>,
        private readonly rowValues: ReadonlyArray<RowValue>
    ) {
        this.parser = new VariableParser();
    }

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
                    !this.rowValues.find(
                        (rowWithValue) =>
                            rowWithValue.key === row.key.description || //
                            rowWithValue.key.startsWith(row.key.description || '' + ':')
                    )
            )
            .map((row) => {
                const column = row.defaultValueColumn.description;
                const value = (typeof row.defaultValue === 'function' ? row.defaultValue(this.rowValues) : row.defaultValue)?.toString();

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
            .concat(this.rowValues);
    }

    /**
     *
     */
    private findDefinition(row: RowValueWithAst): RowDefinition<TExecutionContext, TRowType> {
        const sortedDefinitions = Array.from(this.rowDefinitions).sort(
            (def1, def2) => def2.key.description.length - def1.key.description.length
        );

        const keyStringValue = row.ast.name.value + ':' + (row.ast.qualifier?.stringValue ?? '');

        return sortedDefinitions.find((def) => {
            const defKey = def.key.description;

            // key must match
            return keyStringValue.startsWith(defKey);
        });
    }

    /**
     * checks the correct binding  result
     */
    private checkBinding(ast: ASTAction, rowDefinition: RowDefinition<TExecutionContext, TRowType>): void {
        const throwIf = (condition: boolean, errorMessage: () => string): void => {
            if (condition) {
                throw Error(errorMessage());
            }
        };

        switch (rowDefinition.parameterType) {
            case ParaType.True:
                throwIf(!ast.qualifier, () => `'${this.tableName}': key '${rowDefinition.key.description || ''}' must have a parameter!`);
                break;
            case ParaType.Optional:
                break;
            case ParaType.False:
                throwIf(
                    !!ast.qualifier && !!ast.qualifier.paras?.length,
                    () =>
                        `'${this.tableName}': key '${ast.match}' with definition '${
                            rowDefinition.key.description || ''
                        }' cannot have a parameter: '${ast.qualifier.paras.join(':')}'!`
                );
                break;
        }

        switch (rowDefinition.selectorType) {
            case SelectorType.True:
                throwIf(!ast.selectors?.length, () => `'${this.tableName}': key '${ast.match}' must have a selector!`);
                break;
            case SelectorType.Optional:
                break;
            case SelectorType.False:
                throwIf(
                    !!ast.selectors?.length,
                    () => `'${this.tableName}': key '${ast.match}' cannot have a selector: '${ast.selectors.match || ''}'!`
                );
                break;
        }

        switch (rowDefinition.scopedType) {
            case ScopedType.True:
                throwIf(!ast.scope.value, () => `'${this.tableName}': key '${ast.match}' must have a scope!`);
                break;
            case ScopedType.Optional:
                break;
            case ScopedType.False:
                throwIf(
                    !!ast.scope?.value,
                    () =>
                        `'${this.tableName}': key '${ast.match}' cannot have a scope: '${
                            ast.scope.value
                        }'\n${this.parser.getValueWithMarker(ast.scope.location, ast.match)}'!`
                );
                break;
        }
    }

    /**
     *
     */
    public bind(type: new (def: BaseRowMetaDefinition<TExecutionContext, TRowType>) => TRowType): Array<TRowType> {
        const rows = this.bindDefaultValues();

        return rows?.map((row: RowValueWithAst) => {
            //----------------------------------------------------------------
            // 1. map ast to values
            //----------------------------------------------------------------
            row.ast = this.parser.parseAction(row.key);

            //----------------------------------------------------------------
            // 2. map to definition and if it could mapped
            //----------------------------------------------------------------
            const rowDefinition = this.findDefinition(row);
            if (!rowDefinition) {
                const availableDefs = this.rowDefinitions.map((def) => def.key.description).join(',\n');
                throw Error(`'${this.tableName}': key '${row.key}' is not valid\nvalid definitions are:\n${availableDefs}`);
            }

            //----------------------------------------------------------------
            // 3. checks the correct usage (definition)
            //----------------------------------------------------------------
            this.checkBinding(row.ast, rowDefinition);

            //----------------------------------------------------------------
            // Return definition
            //----------------------------------------------------------------
            let lazyLoad: Record<string, string>;

            return new type({
                _metaDefinition: rowDefinition,
                ast: row.ast,
                get values_replaced() {
                    return !lazyLoad ? (lazyLoad = row.values_replaced) : lazyLoad;
                }
            });
        });
    }
}
