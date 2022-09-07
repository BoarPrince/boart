import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class DependsOnValueValidator implements RowValidator {
    /**
     *
     */
    readonly name = 'DependsOnValueValidator';

    /**
     *
     */
    constructor(private readonly dependOn: { key: string; value: string; column?: string }) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        let count = 0;
        rows?.filter((r) => r.key === this.dependOn.key)
            .filter((r) => r.values_replaced[this.dependOn.column] === this.dependOn.value)
            .forEach(() => count++);

        if (count === 0) {
            throw Error(
                `key '${row._metaDefinition.key.description || ''}' depends on key: '${this.dependOn.key}', value: '${
                    this.dependOn.value
                }', but it does not exist!`
            );
        }
    }
}
