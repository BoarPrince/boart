import { ValidatorFactory } from './ValidatorFactory';

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
    public getRowFactory(name: string): ValidatorFactory {
        if (!this.factories.has(name)) {
            throw new Error(`validator '${name}' does not exist`);
        }
        return this.factories.get(name);
    }
}
