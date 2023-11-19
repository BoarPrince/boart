import * as fs from 'fs';

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
        return ScopedType.False;
    }

    /**
     *
     */
    get priority(): number {
        return 900;
    }

    /**
     *
     * @param arg parser arguments
     */
    replace(arg: ReplaceArg): string {
        const documentName = [arg.qualifier.value].concat(arg.qualifier.paras || []).join('/');
        const fileName = EnvLoader.instance.mapDataFileName(documentName);
        return fs.readFileSync(fileName).toString();
    }
}
