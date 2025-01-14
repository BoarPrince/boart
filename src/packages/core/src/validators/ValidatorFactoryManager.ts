import { ValidatorFactory } from './ValidatorFactory';
import { ValidatorType } from './ValidatorType';

/**
 *
 */
export class ValidatorFactoryManager {
    private factories = new Map<string, ValidatorFactory>();

    /**
     *
     */
    private constructor() {
        // private, because of a singleton
    }

    /**
     *
     */
    static get instance(): ValidatorFactoryManager {
        if (!globalThis._validatorFactoryHandler) {
            const instance = new ValidatorFactoryManager();
            globalThis._validatorFactoryHandler = instance;
        }
        return globalThis._validatorFactoryHandler;
    }

    /**
     *
     */
    public addFactory(factory: ValidatorFactory): void {
        if (this.factories.has(factory.name)) {
            throw new Error(`validator '${factory.name}' already registered`);
        }
        this.factories.set(factory.name, factory);
    }

    /**
     *
     */
    public addFactories(factories: Array<ValidatorFactory>): void {
        factories.forEach((factory) => this.addFactory(factory));
    }

    /**
     *
     */
    public getFactory(name: string): ValidatorFactory {
        if (!this.factories.has(name)) {
            throw new Error(
                `Validator '${name}' does not exist. Available validators: ${Array.from(this.factories.keys())
                    .map((v) => `\n'${v}'`)
                    .join(',')}`
            );
        }
        return this.factories.get(name);
    }

    /**
     *
     */
    public validFactoriesByType(type: ValidatorType): Array<string> {
        return Array.from(this.factories.entries())
            .filter((factory) => factory[1].type === type)
            .map((factory) => factory[0]);
    }

    /**
     *
     */
    clear(): void {
        this.factories.clear();
    }
}
