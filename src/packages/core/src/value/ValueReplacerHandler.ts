import { Initializer } from '../common/Initializer';

import { ValueReplacer } from './ValueReplacer';
import { ValueResolver } from './ValueResolver';

/**
 *
 */
type ValueReplaceItem = {
    readonly identifier: string;
    readonly replacer: ValueReplacer;
};

/**
 *
 */
export class ValueReplacerHandler implements Initializer<ValueReplacer> {
    private valueReplacers: Array<ValueReplaceItem>;
    private valueResolver: ValueResolver;

    /**
     *
     */
    private constructor() {
        this.valueReplacers = [];
        this.valueResolver = new ValueResolver(this);
    }

    /**
     *
     */
    public static get instance(): ValueReplacerHandler {
        if (!globalThis._valueReplaceHandlerInstance) {
            const instance = new ValueReplacerHandler();
            globalThis._valueReplaceHandlerInstance = instance;
        }
        return globalThis._valueReplaceHandlerInstance;
    }

    /**
     *
     */
    public clear() {
        this.valueReplacers = [];
    }

    /**
     *
     */
    public delete(name: string) {
        this.valueReplacers = this.valueReplacers.filter((r) => r.identifier !== name);
    }

    /**
     *
     */
    public get(name: string): ValueReplacer {
        return this.valueReplacers.find((r) => {
            return r.identifier === name;
        })?.replacer;
    }

    /**
     *
     */
    public add(name: string, item: ValueReplacer): Initializer<ValueReplacer> {
        if (!!this.valueReplacers.find((r) => r.identifier === name)) {
            throw Error(`valueReplacer '${name}' already exists!`);
        }

        // eslint-disable-next-line @typescript-eslint/unbound-method
        item.defaultScopeType = item.defaultScopeType || (() => null);

        this.valueReplacers.push({ identifier: name, replacer: item });
        this.valueReplacers = this.valueReplacers.sort((r1, r2) => r1.replacer.priority - r2.replacer.priority);

        return this;
    }

    /**
     *
     */
    public addItems(replacer: readonly ValueReplacer[]): Initializer<ValueReplacer> {
        replacer?.forEach((r) => this.add(r.name, r));
        return this;
    }

    /**
     *
     * @param value contains replacement expressions
     *              like: ${store:var}
     * @returns     replaced expression by it's value
     */
    public static replace(value: string): string {
        return ValueReplacerHandler.instance.replace(value);
    }

    /**
     *
     */
    public replace(value: string): string {
        return this.valueResolver.replace(value);
    }
}
