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
    generate(paras: string[]): string {
        if (paras?.length > 0) {
            throw Error(`paramter '${paras.join(':')}' cannot be defined for uuid generator`);
        }
        return randomUUID();
    }
}
