import fs from 'fs';

import { EnvLoader, ScopedType, ValueReplacer } from '@boart/core';

export class FileReplacer implements ValueReplacer {
    readonly name = 'file';

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.true;
    }

    /**
     *
     */
    get priority(): number {
        return 900;
    }

    /**
     *
     */
    replace(property: string): string {
        const fileName = EnvLoader.instance.mapDataFileName(property);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return fs.readFileSync(fileName).toString();
    }
}
