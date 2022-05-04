import { BaseRowMetaDefinition } from '../BaseRowMetaDefinition';

import { RowValidator } from './RowValidator';

/**
 * Key can only used once a time
 */
export class UniqueValidator implements RowValidator {
    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]) {
        const keyCount = rows.reduce((count, r) => (r.key === row.key ? count + 1 : count), 0);
        if (keyCount > 1) {
            throw Error(`Validator: '${this.constructor.name}' => key '${row.key}' occurs ${keyCount} times`);
        }
    }
}
