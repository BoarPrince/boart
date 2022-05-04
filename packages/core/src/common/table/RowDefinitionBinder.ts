import { ExecutionContext } from '../execution/ExecutionContext';

import { BaseRowMetaDefinition } from './BaseRowMetaDefinition';
import { BaseRowType } from './BaseRowType';
import { ParaType } from './ParaType';
import { RowDefinition } from './RowDefinition';
import { RowValue } from './RowValue';
import { MetaInfo } from './TableMetaInfo';

/**
 *
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
        const throwIf = (condition: boolean, errorMessage: string): void => {
            if (condition) {
                throw Error(errorMessage);
            }
        };

        return this.rowsWithValues?.map(row => {
            const rowDef = { para: null } as {
                key: string;
                para: string;
                definition: RowDefinition<TExecutionContext, TRowType>;
            };
            for (const paraDef of this.rowDefinitions) {
                const paraKey = paraDef.key.description + ':';
                if (paraDef.key.description === row.key) {
                    rowDef.key = paraDef.key.description;
                    rowDef.definition = paraDef;
                    break;
                } else if (row.key.startsWith(paraKey)) {
                    rowDef.key = paraDef.key.description;
                    rowDef.definition = paraDef;
                    rowDef.para = row.key.replace(paraKey, '');
                    break;
                }
            }

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
                    throwIf(!!rowDef.para, `'${this.tableName}': key '${row.key}' cannot have a parameter: '${rowDef.para}'!`);
                    break;
            }

            const rows = new type({
                _metaDefinition: rowDef.definition,
                key: rowDef.key,
                keyPara: rowDef.para,
                values: row.values,
                values_replaced: row.values_replaced
            });

            return this.bindDefaultValues(rows);
        });
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
