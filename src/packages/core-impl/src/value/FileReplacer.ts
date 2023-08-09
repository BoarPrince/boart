import fs from 'fs';

import { EnvLoader, ReplaceArg, ScopedType, ValueReplacer } from '@boart/core';
import { ValueReplacerConfig } from './ValueReplacer';

export class FileReplacer implements ValueReplacer {
    readonly name = 'file';

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        hasQualifier: true,
        qualifierParaCountMin: 1
    };

    /**
     *
     */
    get scoped(): ScopedType {
        return ScopedType.false;
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
        return fs.readFileSync(fileName).toString();
    }

    /**
     *
     * @param arg parser arguments
     */
    replace2(arg: ReplaceArg): string {
        const fileName = [arg.qualifier.value].concat(arg.qualifier.paras || []).join('/');
        return fs.readFileSync(fileName).toString();
    }
}
