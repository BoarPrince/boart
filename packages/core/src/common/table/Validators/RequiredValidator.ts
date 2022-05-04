import { BaseRowMetaDefinition } from '../BaseRowMetaDefinition';

import { GroupValidator } from './GroupValidator';

/**
 * Key must occur
 */
export class RequiredValidator implements GroupValidator {
    /**
     *
     */
    constructor(private readonly keys: readonly symbol[]) {}

    /**
     *
     */
    get name() {
        return 'RequiredValidator';
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(rows: readonly BaseRowMetaDefinition<any, any>[]) {
        this.keys.forEach(key => {
            const count = rows.filter(row => row.key === key.description)?.length || 0;
            if (count === 0) {
                throw Error(`Key '${key.description}' is required, but it's missing`);
            }
        });
    }
}
