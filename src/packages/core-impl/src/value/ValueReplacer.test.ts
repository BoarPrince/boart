/* eslint-disable @typescript-eslint/unbound-method */
import { EnvLoader, GeneratorHandler, ScopedType, ScopeType, Store, TextLanguageHandler, ValueReplacer } from '@boart/core';

import { EnvironmentReplacer } from './EnvironmentReplacer';
import { GenerateReplacer } from './GenerateReplacer';
import { ReferenceHandler } from './ReferenceHandler';
import { ReferenceReplacer } from './ReferenceReplacer';
import { StoreReplacer } from './StoreReplacer';
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

    /**
     *
     */
    const storeFactory = (baseStore: Map<string, string>) => ({
        clear: () => baseStore.clear(),
        put: jest.fn((key: string, value: string) => baseStore.set(key, value)),
        get: jest.fn((key: string) => baseStore.get(key)),
        store: {
            put: jest.fn((key: string, value: string) => baseStore.set(key, value)),
            get: jest.fn((key: string) => baseStore.get(key))
        }
    });

    /**
     *
     */
    return {
        __esModule: true,
        ...originalModule,
        StoreWrapper: jest.fn().mockImplementation(() => storeFactory(scenarioMap)),
        Store: {
            instance: {
                globalStore: storeFactory(suiteMap),
                localStore: storeFactory(specMap),
                testStore: storeFactory(scenarioMap),
                stepStore: storeFactory(stepMap)
            }
        },
        EnvLoader: {
            instance: {
                get: jest.fn(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                mapReportData: (path: string) => originalModule.EnvLoader.instance.mapReportData(path)
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
beforeEach(() => {
    Store.instance.globalStore.clear();
    Store.instance.localStore.clear();
    Store.instance.testStore.clear();
    Store.instance.stepStore.clear();
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

    const getter = EnvLoader.instance.get;
    expect(getter).toBeCalled();
    expect(getter).toBeCalledWith('yyyy', null, true);
});

/**
 *
 */
it('check text replacer', () => {
    const sut: ValueReplacer = new TextReplacer();

    expect(sut.name).toBe('text');
    sut.replace('xxxx');

    const getter = TextLanguageHandler.instance.get;
    expect(getter).toBeCalled();
    expect(getter).toBeCalledWith('xxxx');
});

/**
 *
 */
describe('generate', () => {
    /**
     *
     */
    it('default', () => {
        const sut: ValueReplacer = new GenerateReplacer();
        const store = Store.instance.testStore;

        sut.replace('xxxx', store);

        const generater = GeneratorHandler.instance.generate;

        expect(generater).toBeCalled();
        expect(generater).toBeCalledWith('xxxx');
        expect(store.store.get).toBeCalledWith('#generate#:#xxxx#');
    });

    /**
     *
     */
    it('with arguments', () => {
        const sut: ValueReplacer = new GenerateReplacer();
        const store = Store.instance.testStore;

        sut.replace('xxxx:arg1:arg2', store);

        const generater = GeneratorHandler.instance.generate;

        expect(generater).toBeCalled();
        expect(generater).toBeCalledWith('xxxx:arg1:arg2');
        expect(store.store.get).toBeCalledWith('#generate#:#xxxx:arg1:arg2#');
    });

    /**
     *
     */
    it('with extended namescope', () => {
        const sut: ValueReplacer = new GenerateReplacer();
        const store = Store.instance.testStore;

        expect(sut.name).toBe('generate');
        sut.replace('@name:xxxx:arg1:arg2', store);

        const generater = GeneratorHandler.instance.generate;

        expect(generater).toBeCalled();
        expect(generater).toBeCalledWith('xxxx:arg1:arg2');
        expect(store.store.get).toBeCalledWith('#generate#:#name#:#xxxx:arg1:arg2#');
    });
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
        const store = Store.instance.testStore;

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        sut.replace('\\x/x-x/-x-x#_y-yyy2', store);

        const getter = ReferenceHandler.getProperty;

        expect(getter).toBeCalled();
        expect(getter).toBeCalledWith('\\x/x-x/-x-x', '_y-yyy2');
        expect(store.store.get).toBeCalledWith('#ref#:#\\x/x-x/-x-x#_y-yyy2#');
    });

    /**
     *
     */
    it('check reference replacer (not valid property)', () => {
        const sut: ValueReplacer = new ReferenceReplacer();
        const store = Store.instance.testStore;

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        const value = sut.replace('\\xxxxx##yyyy', store);

        const getter = ReferenceHandler.getProperty;
        expect(getter).not.toBeCalled();
        expect(value).toBeNull();
        expect(store.store.get).toBeCalledWith('#ref#:#\\xxxxx##yyyy#');
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
        const store = Store.instance.testStore;

        expect(sut.name).toBe('store');
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.multiple);

        const replacedValue = sut.replace('xxxxx##yyyy', store, null);

        expect(replacedValue).toBeNull();
    });

    /**
     *
     */
    it('with default, no scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace('xxxxx##yyyy:-default', store, null);

        expect(replacedValue).toBe('default');
    });

    /**
     *
     */
    it('test scope - value defined', () => {
        Store.instance.testStore.put('x', 1);
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace('x', store, ScopeType.Test);

        expect(replacedValue).toBe('1');
    });

    /**
     *
     */
    it('no scope - value defined', () => {
        Store.instance.testStore.put('x', 1);
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        expect(sut.name).toBe('store');
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.multiple);

        const replacedValue = sut.replace('x', store, null);

        expect(replacedValue).toBe('1');
    });

    /**
     *
     */
    it('no scope - use assign operator', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace('x:=2', store, null);

        expect(replacedValue).toBe('2');
        expect(store.store.get('x')).toBe('2');
    });

    /**
     *
     */
    it('no scope - use assign operator with store attribute', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace('x#y:=2', store);

        expect(replacedValue).toBe('2');
        expect(store.put).toHaveBeenCalled();
        expect(store.put).toHaveBeenCalledWith('x#y', '2');
    });

    /**
     *
     */
    it('error when operator not valid', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        expect(() => sut.replace('x:<y', store, null)).toThrowError("store default operator ':<' not valid (x:<y)");
    });

    /**
     *
     */
    it('expression not valid must throw an error', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        expect(() => sut.replace('x:=', store, null)).toThrowError(`store expression 'x:=' not valid`);
    });

    /**
     *
     */
    it('wrong default operator must throw an error', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        expect(() => sut.replace('x:?default', store, null)).toThrowError(`store default operator ':?' not valid`);
    });

    /**
     *
     */
    it('replacement with global (suite) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.globalStore;
        store.put('a', 1);

        const replacedValue = sut.replace('a', store, ScopeType.Global);

        expect(replacedValue).toBe('1');
        expect(Store.instance.globalStore.get).toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('replacement with file/local (spec) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.localStore;
        store.put('a', 2);

        const replacedValue = sut.replace('a', store, ScopeType.Local);

        expect(replacedValue).toBe('2');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('replacement with test (scenario) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;
        store.put('a', 3);

        const replacedValue = sut.replace('a', store, ScopeType.Local);

        expect(replacedValue).toBe('3');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).toHaveBeenCalled();
        expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('replacement with step (step) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.stepStore;
        store.put('a', 4);

        const replacedValue = sut.replace('a', store, ScopeType.Step);

        expect(replacedValue).toBe('4');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });

    /**
     *
     */
    it('no scope, variable in global', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.globalStore;
        store.put('a', 1);

        const replacedValue = sut.replace('a', store);

        expect(replacedValue).toBe('1');
        expect(Store.instance.globalStore.get).toHaveBeenCalled();
        expect(Store.instance.localStore.get).toHaveBeenCalled();
        expect(Store.instance.testStore.get).toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });

    /**
     *
     */
    it('no scope, variable in local', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.localStore;
        store.put('a', 2);

        const replacedValue = sut.replace('a', store);

        expect(replacedValue).toBe('2');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).toHaveBeenCalled();
        expect(Store.instance.testStore.get).toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });

    /**
     *
     */
    it('no scope, variable in test', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;
        store.put('a', 3);

        const replacedValue = sut.replace('a', store);

        expect(replacedValue).toBe('3');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });

    /**
     *
     */
    it('no scope, variable in step', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.stepStore;
        store.put('a', 4);

        const replacedValue = sut.replace('a', store);

        expect(replacedValue).toBe('4');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });
});
