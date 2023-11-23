import { Context, DataContentHelper, ScopedType, ValueReplaceArg, ValueReplacer, ValueReplacerConfig } from '@boart/core';

/**
 *
 */
export class ContextReplacer implements ValueReplacer {
    readonly name = 'context';

    readonly scoped = ScopedType.False;
    readonly nullable = true;

    /**
     *
     */
    readonly config: ValueReplacerConfig = {
        hasQualifier: true
    };

    /**
     *
     */
    get priority(): number {
        return 950;
    }

    /**
     *
     */
    replace(ast: ValueReplaceArg): string {
        // e.g. read context:payload -> get the payload
        // or   read context:payload#id -> get the payload#id
        const value = Context.instance.get(ast);
        if (!DataContentHelper.isNullOrUndefined(value)) {
            return DataContentHelper.create(value).toString();
        }

        if (!ast.default) {
            throw Error(`context '${ast.qualifier.selectorMatch ?? ''}' not defined`);
        }

        return ast.default.value;
    }
}
