import { Context, ValueReplaceArg } from '@boart/core';

import { RunArg } from './RunArg';

/**
 *
 */

export class RunDefinition {
    /**
     *
     */
    private constructor(
        public name: string,
        public args: Record<string, string>
    ) {}

    /**
     *
     */
    static parse(definition: string, defaultArgs: Record<string, string>): RunDefinition {
        const nameAndArgs = definition.split(':');
        return new RunDefinition(nameAndArgs.shift(), RunArg.parse(nameAndArgs.join(':'), defaultArgs));
    }

    /**
     *
     */
    public addArgsToContext(): void {
        Object.entries(this.args).forEach(([name, value]) => {
            const ast: ValueReplaceArg = {
                match: name,
                qualifier: {
                    value: name,
                    paras: [],
                    stringValue: name
                }
            };
            Context.instance.put(ast, value);
        });
    }
}
