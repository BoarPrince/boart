import { RunArg } from './RunArg';
import { RunDefinition } from './RunDefinition';

/**
 *
 */
export class RunDefinitionParser {
    private static readonly defaultArgRe = /^::(?<args>[^,]+)::$/;

    /**
     *
     */
    private constructor() {
        // only static methods
    }

    /**
     *
     */
    public static parse(runDefinition: string): Array<RunDefinition> {
        const runTokens = (runDefinition || '')
            .toString()
            .split(/[,\s]/)
            .filter((r) => !!r);

        if (runTokens.length === 0) {
            return [];
        }

        const argsMatch = runTokens[0].match(this.defaultArgRe);
        let defaultArgs: Record<string, string> = {};
        if (argsMatch) {
            runTokens.shift();
            defaultArgs = RunArg.parse(argsMatch.groups.args);
        }

        return runTokens.map((def) => RunDefinition.parse(def, defaultArgs));
    }
}
