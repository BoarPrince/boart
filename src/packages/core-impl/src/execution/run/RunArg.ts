/**
 *
 */

export class RunArg {
    private static readonly argRe = /^\s*(?<value>[^@]+)(@(?<name>[^@]+))?$/;

    /**
     *
     */
    private constructor(public name: string, public value: string) {}

    /**
     *
     */
    static parse(argDefinition: string, defaultArgs: Record<string, string> = {}): Record<string, string> {
        const defaultKeys = Object.keys(defaultArgs);
        const getArgName = (index: number): string => {
            return defaultKeys.length <= index ? `arg${index + 1}` : defaultKeys[index];
        };
        const definitionArgs = (argDefinition || '') //
            .split(':')
            .filter((a) => !!a)
            .reduce((args, arg, index) => {
                const match = arg.match(RunArg.argRe) || { groups: { name: getArgName(index), value: arg } };
                args[match.groups.name || getArgName(index)] = match.groups.value;
                return args;
            }, {} as Record<string, string>);

        return Object.assign({}, defaultArgs, definitionArgs);
    }
}
