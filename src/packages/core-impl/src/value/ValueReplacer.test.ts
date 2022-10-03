import { EnvLoader, GeneratorHandler, ScopedType, ScopeType, Store, TextLanguageHandler, ValueReplacer } from '@boart/core';

import { EnvironmentReplacer } from './EnvironmentReplacer';
import { GenerateReplacer } from './GenerateReplacer';
import { ReferenceHandler } from './ReferenceHandler';
import { ReferenceReplacer } from './ReferenceReplacer';
import { StoreReplacer } from './StoreReplace';
import { TextReplacer } from './TextReplacer';

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    const suiteMap = new Map<string, string>();
    const specMap = new Map<string, string>();
    const scenarioMap = new Map<string, string>();
    const stepMap = new Map<string, string>();

    return {
        __esModule: true,
        ...originalModule,
        Store: {
            instance: {
                globalStore: {
                    clear: () => suiteMap.clear(),
                    put: jest.fn((key: string, value: string) => suiteMap.set(key, value)),
                    get: jest.fn((key: string) => suiteMap.get(key)),
                    store: {
                        put: jest.fn((key: string, value: string) => suiteMap.set(key, value)),
                        get: jest.fn((key: string) => suiteMap.get(key))
                    }
                },
                localStore: {
                    clear: () => specMap.clear(),
                    put: jest.fn((key: string, value: string) => specMap.set(key, value)),
                    get: jest.fn((key: string) => specMap.get(key)),
                    store: {
                        put: jest.fn((key: string, value: string) => specMap.set(key, value)),
                        get: jest.fn((key: string) => specMap.get(key))
                    }
                },
                testStore: {
                    clear: () => scenarioMap.clear(),
                    put: jest.fn((key: string, value: string) => scenarioMap.set(key, value)),
                    get: jest.fn((key: string) => scenarioMap.get(key)),
                    store: {
                        put: jest.fn((key: string, value: string) => scenarioMap.set(key, value)),
                        get: jest.fn((key: string) => scenarioMap.get(key))
                    }
                },
                stepStore: {
                    clear: () => stepMap.clear(),
                    put: jest.fn((key: string, value: string) => stepMap.set(key, value)),
                    get: jest.fn((key: string) => stepMap.get(key)),
                    store: {
                        put: jest.fn((key: string, value: string) => stepMap.set(key, value)),
                        get: jest.fn((key: string) => stepMap.get(key))
                    }
                }
            }
        },
        EnvLoader: {
            instance: {
                get: jest.fn()
            }
        },
        GeneratorHandler: {
            instance: {
                generate: jest.fn()
            }
        },
        TextLanguageHandler: {
            instance: {
                get: jest.fn()
            }
        }
    };
});

/**
 *
 */
jest.mock('./ReferenceHandler', () => {
    return {
        ReferenceHandler: {
            getProperty: jest.fn()
        }
    };
});

/**
 *
 */
it('check environment replacement', () => {
    const sut: ValueReplacer = new EnvironmentReplacer();

    expect(sut.name).toBe('env');
    expect(sut.priority).toBe(1000);
    expect(sut.scoped).toBe(ScopedType.false);

    sut.replace('yyyy');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const getter = EnvLoader.instance.get;
    expect(getter).toBeCalled();
    expect(getter).toBeCalledWith('yyyy', null, true);
});

/**
 *
 */
it('check generate replacer', () => {
    const sut: ValueReplacer = new GenerateReplacer();
    const store = Store.instance.testStore.store;

    expect(sut.name).toBe('generate');
    expect(sut.priority).toBe(900);
    expect(sut.scoped).toBe(ScopedType.true);

    sut.replace('xxxx', store);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const generater = GeneratorHandler.instance.generate;

    expect(generater).toBeCalled();
    expect(generater).toBeCalledWith('xxxx');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(store.get).toBeCalledWith('#generate#:#xxxx#');
});

/**
 *
 */
it('check text replacer', () => {
    const sut: ValueReplacer = new TextReplacer();

    expect(sut.name).toBe('TextReplacer');
    expect(sut.priority).toBe(950);
    expect(sut.scoped).toBe(ScopedType.false);

    sut.replace('xxxx');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const getter = TextLanguageHandler.instance.get;
    expect(getter).toBeCalled();
    expect(getter).toBeCalledWith('xxxx');
});

/**
 *
 */
describe('reference', () => {
    /**
     *
     */
    it('check reference replacer (valid property)', () => {
        const sut: ValueReplacer = new ReferenceReplacer();
        const store = Store.instance.testStore.store;

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        sut.replace('\\x/x-x/-x-x#_y-yyy2', store);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        const getter = ReferenceHandler.getProperty;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const storeGetter = store.get;

        expect(getter).toBeCalled();
        expect(getter).toBeCalledWith('\\x/x-x/-x-x', '_y-yyy2');
        expect(storeGetter).toBeCalledWith('#ref#:#\\x/x-x/-x-x#_y-yyy2#');
    });

    /**
     *
     */
    it('check reference replacer (not valid property)', () => {
        const sut: ValueReplacer = new ReferenceReplacer();
        const store = Store.instance.testStore.store;

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        const value = sut.replace('\\xxxxx##yyyy', store);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const storeGetter = store.get;

        // eslint-disable-next-line @typescript-eslint/unbound-method
        const getter = ReferenceHandler.getProperty;
        expect(getter).not.toBeCalled();
        expect(value).toBeNull();
        expect(storeGetter).toBeCalledWith('#ref#:#\\xxxxx##yyyy#');
    });
});

/**
 *
 */
describe('store', () => {
    /**
     *
     */
    it('no default, no scope', () => {
        const sut: ValueReplacer = new StoreReplacer();

        expect(sut.name).toBe('store');
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.multiple);

        const replacedValue = sut.replace('xxxxx##yyyy', Store.instance.testStore.store, null);
        expect(replacedValue).toBeNull();
    });

    /**
     *
     */
    it('with default, no scope', () => {
        const sut: ValueReplacer = new StoreReplacer();

        const replacedValue = sut.replace('xxxxx##yyyy:-default', Store.instance.testStore.store, null);
        expect(replacedValue).toBe('default');
    });

    /**
     *
     */
    it('test scope - value defined', () => {
        Store.instance.testStore.put('x', 1);
        const sut: ValueReplacer = new StoreReplacer();

        const replacedValue = sut.replace('x', Store.instance.testStore.store, ScopeType.Test);
        expect(replacedValue).toBe('1');
    });

    /**
     *
     */
    it('no scope - value defined', () => {
        Store.instance.testStore.put('x', 1);
        const sut: ValueReplacer = new StoreReplacer();

        expect(sut.name).toBe('store');
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.multiple);

        const replacedValue = sut.replace('x', Store.instance.testStore.store, null);
        expect(replacedValue).toBe('1');
    });

    /**
     *
     */
    it('no scope - use assign operator', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore.store;

        const replacedValue = sut.replace('x:=2', store, null);
        expect(replacedValue).toBe('2');
        expect(store.get('x')).toBe('2');
    });

    /**
     *
     */
    it('expression not valid must throw an error', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore.store;

        expect(() => sut.replace('x:=', store, null)).toThrowError(`store expression 'x:=' not valid`);
    });

    /**
     *
     */
    it('wrong default operator must throw an error', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore.store;

        expect(() => sut.replace('x:?default', store, null)).toThrowError(`store default operator ':?' not valid`);
    });
});
