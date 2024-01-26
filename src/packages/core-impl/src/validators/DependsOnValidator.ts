import { BaseRowMetaDefinition, RowValidator } from '@boart/core';

/**
 *
 */
export class DependsOnValidator implements RowValidator {
    /**
     *
     */
    readonly name = 'DependsOnValidator';

    /**
     *
     */
    constructor(private readonly dependOnKey: string[]) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        let count = 0;
        this.dependOnKey.forEach((key) =>
            rows?.forEach((r) => (count += r.ast.name.value === key || r.ast.name.stringValue === key ? 1 : 0))
        );

        if (count === 0) {
            throw Error(
                `key '${row._metaDefinition.key.description || ''}' depends on ${this.dependOnKey
                    .map((k) => `'${k}'`)
                    .join(' or ')}, but it does not exist!`
            );
        }
    }
}
