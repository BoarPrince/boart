import { BaseRowMetaDefinition, GroupValidator } from '@boart/core';

/**
 *
 */
export class XORValidator implements GroupValidator {
    /**
     *
     */
    constructor(private readonly keys: readonly symbol[]) {}

    /**
     *
     */
    get name() {
        return 'XORValidator';
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(rows: readonly BaseRowMetaDefinition<any, any>[]) {
        const keys = this.keys.map((k) => k.description);
        const existingKeys = rows.reduce((o, r) => {
            if (keys.includes(r.key)) {
                o.push(r.key);
            }
            return o;
        }, []);
        if (existingKeys.length === 0) {
            throw Error(`One of the following keys '${keys?.join(', ')}' must exists, but no one exists`);
        } else if (existingKeys.length > 1) {
            throw Error(`Exactly one of the keys '${keys?.join(', ')}' must exists, but '${existingKeys?.join(', ')}' exists`);
        }
    }
}
