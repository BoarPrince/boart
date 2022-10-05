import { Initializer } from '../common/Initializer';

import { Generator } from './Generator';

/**
 *
 */
export class GeneratorHandler implements Initializer<Generator> {
    private readonly generators: Map<string, Generator>;

    /**
     *
     */
    private constructor() {
        this.generators = new Map();
    }

    /**
     *
     */
    public static get instance(): GeneratorHandler {
        if (!globalThis._generatorHandlerInstance) {
            globalThis._generatorHandlerInstance = new GeneratorHandler();
        }
        return globalThis._generatorHandlerInstance;
    }

    /**
     *
     */
    public clear() {
        this.generators.clear();
    }

    /**
     *
     */
    public delete(name: string) {
        this.generators.delete(name);
    }

    /**
     *
     */
    public add(name: string, item: Generator): Initializer<Generator> {
        if (this.generators.has(name)) {
            throw Error(`generator '${name}' already exists!`);
        }
        this.generators.set(name, item);
        return this;
    }

    /**
     *
     */
    public get(name: string): Generator {
        if (!this.generators.has(name)) {
            throw Error(`generator '${name}' does not exists!`);
        }
        return this.generators.get(name);
    }

    /**
     *
     */
    addItems(generator: readonly Generator[]): Initializer<Generator> {
        generator?.forEach((g) => this.add(g.name, g));
        return this;
    }

    /**
     *
     */
    public generate(definition: string): string {
        const match = definition.match(/^(?<name>[^:]+)(:(?<parameter>.+))?$/);

        if (!match) {
            throw Error(`generator definition '${definition}' can't be resolved!`);
        }

        const generator = this.generators.get(match.groups.name);
        if (!generator) {
            throw Error(`generator '${match.groups.name}' can't be found!`);
        }

        const parameters = (match.groups.parameter || '').split(':');
        return generator.generate(...parameters);
    }
}
