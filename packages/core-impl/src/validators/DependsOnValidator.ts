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
    constructor(private readonly dependOnKey: symbol) {}

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        const count = rows?.reduce((c, r) => (r.key === this.dependOnKey.description ? c + 1 : c), 0);
        if (count === 0) {
            throw Error(
                `key '${row._metaDefinition.key.description}' depends on '${this.dependOnKey.description}', but it does not exist!`
            );
        }
    }
}
