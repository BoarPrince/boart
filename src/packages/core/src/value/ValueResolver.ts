import { VariableParser } from '../parser/VariableParser';
import { PipeResolver } from '../pipe/PipeResolver';
import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

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
        let replacedValue = this.replaceOneMatch(value);
        while (value !== replacedValue) {
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
                return Store.instance.nullStore;
            }
        }
    }

    /**
     *
     */
    private replaceOneMatch(value: string): string {
        const ast = this.parser.parse(value);

        if (!ast) {
            return value;
        }

        const replacer = this.handler.get(ast.name.value);
        if (!replacer) {
            throw new Error(`replacer "${ast.name.value}" does not exist`);
        }

        if (replacer.scoped === ScopedType.false && !!ast.scope) {
            const matchWithMarker = this.parser.getValueWithMarker(ast.scope.location, ast.match);
            throw new Error(`value replacer "${ast.name.value}" can't have a scope!\n${matchWithMarker}`);
        }

        const defaultScopeType = replacer.defaultScopeType2 || ScopeType.Step;
        const store = ValueResolver.getStore(ast.scope?.value || defaultScopeType);

        const replacement = replacer.replace2(ast, store);
        const replacedValue = value.replace(ast.match, replacement);

        switch (replacedValue) {
            case 'null':
                return null;
            case 'undefined':
                return undefined;
            default:
                return  this.pipeResolver.resolve(replacedValue, ast);
        }
    }
}
