import { DataContentHelper } from '../data/DataContentHelper';
import { VariableParser } from '../parser/VariableParser';
import { ASTVariable } from '../parser/ast/ASTVariable';
import { PipeResolver } from '../pipe/PipeResolver';
import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';

import { OperatorType } from './OperatorType';
import { ValueReplaceArg, ValueReplacerConfig } from './ValueReplacer';
import { ValueReplacerHandler } from './ValueReplacerHandler';

/**
 *
 */
export class ValueResolver {
    private readonly parser: VariableParser;
    private readonly pipeResolver: PipeResolver;

    /**
     *
     */
    constructor(private handler: ValueReplacerHandler) {
        this.parser = new VariableParser();
        this.pipeResolver = new PipeResolver();
    }

    /**
     *
     */
    public replace(value: string): string {
        let iterationCount = 0;
        let replacedValue = this.replaceOneMatch(value);
        while (value !== replacedValue) {
            if (iterationCount++ >= 10) {
                throw new Error(`"${value}" cannot be resolved`);
            }
            value = replacedValue;
            // recursive replacement
            replacedValue = this.replaceOneMatch(value);
        }

        return value;
    }

    /**
     *
     */
    private static getStore(scope: ScopeType): StoreWrapper {
        switch (scope) {
            case ScopeType.Global: {
                return Store.instance.globalStore;
            }
            case ScopeType.Local: {
                return Store.instance.localStore;
            }
            case ScopeType.Step: {
                return Store.instance.stepStore;
            }
            case ScopeType.Test: {
                return Store.instance.testStore;
            }
            default: {
                return null;
            }
        }
    }

    /**
     *
     */
    private useDefault(ast: ValueReplaceArg, store: StoreWrapper): string {
        if (!ast.default) {
            return null;
        }

        const defaultValue = ast.default.value;

        switch (ast.default.operator) {
            case OperatorType.Default:
                return defaultValue;

            case OperatorType.DefaultAssignment: {
                store.put(ast, DataContentHelper.create(defaultValue));
                return defaultValue;
            }

            case OperatorType.None:
                return null;

            case OperatorType.Unknown:
            default:
                throw Error(`store default operator '${ast.default.operator}' not valid (${ast.match || ''})`);
        }
    }

    /**
     *
     */
    private checkConfig(ast: ASTVariable, config: ValueReplacerConfig): void {
        // check scope
        if (config.scopeAllowed === false && ast.scope?.value) {
            const marker = this.parser.getValueWithMarker(ast.scope.location, ast.match);
            throw Error(`scope not allowed: ${marker}\n${ast.match}`);
        }

        // check qualifier
        if (config.hasQualifier === false && ast.qualifier?.value) {
            throw Error(`no qualifier allowed: ${ast.qualifier.value}\n${ast.match}`);
        }

        // check min qualifier parameter
        if (config.qualifierParaCountMin > ast.qualifier?.paras?.length) {
            throw Error(
                `at least ${config.qualifierParaCountMin || 0} qualifier(s) are required, but only ${
                    ast.qualifier?.paras?.length ?? 0
                } exists: ${ast.qualifier.paras.join(':')}\n${ast.match}`
            );
        }

        // check max qualifier parameter
        if (config.qualifierParaCountMax < ast.qualifier?.paras?.length) {
            throw Error(
                `max ${config.qualifierParaCountMin || 0} qualifier(s) allowed, but ${
                    ast.qualifier?.paras?.length ?? 0
                } found: ${ast.qualifier.paras.join(':')}\n${ast.match}`
            );
        }

        // check min selector count
        if (config.selectorsCountMin > ast.selectors?.length) {
            throw Error(
                `at least ${config.selectorsCountMin || 0} selector(s) are required, but only ${ast.selectors?.length ?? 0} exists: ${
                    ast.match
                }`
            );
        }

        // check max selector count
        if (config.selectorsCountMax < ast.selectors?.length) {
            throw Error(`max ${config.selectorsCountMax || 0} selector(s) allowed, but ${ast.selectors?.length ?? 0} found: ${ast.match}`);
        }
    }

    /**
     *
     */
    private getInnerMatch(value: string): string {
        if (value == null) {
            return;
        }
        const escapedValue = value //
            .replace(/\\\\/g, '\x01')
            .replace(/\\{/g, '\x02')
            .replace(/\\}/g, '\x03')
            .replace(/\\"/g, '\x04')
            .replace(/\\'/g, '\x05');

        const stringMatchList = new Array<string>();
        const valueWithoutStrings = escapedValue.replace(/"[^"]*"|'[^']*'/gm, (matchedValue: string) => {
            stringMatchList.push(matchedValue);
            return `\\${stringMatchList.length - 1}`;
        });

        const singleVarRe = /\$\{[^{}]+\}/;
        for (const stringMatch of stringMatchList) {
            const match = singleVarRe.exec(stringMatch);
            if (match) {
                return match[0];
            }
        }

        const wholeMatch = singleVarRe.exec(valueWithoutStrings);
        if (!wholeMatch) {
            return null;
        }

        return wholeMatch[0].replace(/\\([0-9]+)/g, (match: string, index: string) => {
            return stringMatchList[parseInt(index)];
        });
    }

    /**
     *
     */
    private replaceOneMatch(value: string): string {
        const match = this.getInnerMatch(value);
        const ast = !match ? null : this.parser.parseVariable(match);

        if (!ast) {
            return value;
        }

        const replacer = this.handler.get(ast.name.value);
        if (!replacer) {
            throw new Error(`replacer "${ast.name.value}" does not exist`);
        }

        this.checkConfig(ast, replacer.config);

        const store = ValueResolver.getStore(ast.scope?.value || replacer.config.defaultScopeType);
        const replacement = replacer.replace(ast, store) ?? this.useDefault(ast, store);

        const replacedValue = value //
            // "$" makes problem for replacing -> $1, $2, ...
            .replace(ast.match, replacement?.replace(/\$/g, '\x01') ?? null)
            // eslint-disable-next-line no-control-regex
            .replace(/\x01/g, '$');

        switch (replacedValue) {
            case 'null':
                return null;
            case 'undefined':
                return undefined;
            default:
                return this.pipeResolver.resolve(replacedValue, ast);
        }
    }
}
