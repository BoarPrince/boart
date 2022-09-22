import { randomUUID } from 'crypto';

import { Generator } from '@boart/core';

/**
 *
 */
export class UUIDGenerator implements Generator {
    /**
     *
     */
    readonly name = 'uuid';

    /**
     *
     */
    generate(para?: string): string {
        if (!!para) {
            throw Error(`paramter '${para}' cannot be defined for uuid generator`);
        }
        return randomUUID();
    }
}
