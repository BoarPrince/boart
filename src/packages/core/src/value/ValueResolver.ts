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
    private readonly singleVarRe: RegExp;

    /**
     *
     */
    constructor(private handler: ValueReplacerHandler) {
        this.parser = new VariableParser();
        this.pipeResolver = new PipeResolver();
        this.singleVarRe = /\$\{[^{}]+\}/;
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
    private default(ast: ValueReplaceArg, store: StoreWrapper): string {
        if (!ast.default) {
            return null;
        }

        switch (ast.default.operator) {
            case OperatorType.Default:
                return ast.default.value;

            case OperatorType.DefaultAssignment: {
                store.put(ast, ast.default.value);
                return ast.default.value;
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

        // check default assignment
        if (ast.default?.operator === OperatorType.DefaultAssignment && !ast.selectors?.length) {
            const marker = this.parser.getValueWithStartMarker(ast.default.location, ast.match);
            throw Error(`selector is required in case of default assignment: ${marker}\n${ast.match}`);
        }
    }

    /**
     *
     */
    private replaceOneMatch(value: string): string {
        const match = this.singleVarRe.exec(value);
        const ast = match ? this.parser.parseVariable(match[0]) : null;

        if (!ast) {
            return value;
        }

        const replacer = this.handler.get(ast.name.value);
        if (!replacer) {
            return value;
        }

        this.checkConfig(ast, replacer.config);

        const store = ValueResolver.getStore(ast.scope?.value || replacer.config.defaultScopeType);

        const replacement = replacer.replace(ast, store) ?? this.default(ast, store);
        const replacedValue = value.replace(ast.match, replacement);

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
