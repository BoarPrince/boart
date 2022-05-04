import { randomUUID } from 'crypto';

import { Generator } from './Generator';

/**
 *
 */
export class UUIDGenerator implements Generator {
    /**
     *
     */
    readonly name = 'UUIDGenerator';

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
