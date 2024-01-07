import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
type ValuePara = { key: string; value: string; column: string };

/**
 *
 */
export class DependsOnValueValidator implements RowValidator {
    readonly name = 'DependsOnValueValidator';
    private readonly dependOn: Array<ValuePara>;

    /**
     *
     */
    constructor(dependOn: Array<ValuePara> | ValuePara) {
        this.dependOn = Array.isArray(dependOn) ? dependOn : [dependOn];
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        let count = 0;
        this.dependOn.forEach((dependOn) => {
            rows.filter((r) => r.ast.name.value === dependOn.key)
                .filter((r) => r.values_replaced[dependOn.column] === dependOn.value)
                .forEach(() => count++);
        });

        if (count === 0) {
            throw Error(
                `key '${row._metaDefinition.key.description || ''}' depends on key: ${this.dependOn
                    .map((d) => `'${d.key} -> action:${d.value}'`)
                    .join(' or ')}, but it does not exist!`
            );
        }
    }
}
