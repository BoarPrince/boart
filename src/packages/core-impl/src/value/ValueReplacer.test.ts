import {
    ASTSelectorType,
    EnvLoader,
    GeneratorHandler,
    ScopedType,
    Store,
    StoreWrapper,
    TextLanguageHandler,
    ValueReplacer,
    VariableParser
} from '@boart/core';

import { EnvironmentReplacer } from './EnvironmentReplacer';
import { GenerateReplacer } from './GenerateReplacer';
import { ReferenceHandler } from './ReferenceHandler';
import { ReferenceReplacer } from './ReferenceReplacer';
import { StoreReplacer } from './StoreReplacer';
import { TextReplacer } from './TextReplacer';

/**
 *
 */
const variableParser = new VariableParser();

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    /**
     *
     */
    const storeFactory = (orig: StoreWrapper) => ({
        clear: () => orig.store.clear(),
        storeName: orig.storeName,
        put: jest.fn((key: string, value: string) => orig.put(key, value)),
        get: jest.fn((key: string) => orig.get(key)),
        store: {
            put: jest.fn((key: string, value: string) => orig.put(key, value)),
            get: jest.fn((key: string) => orig.get(key))
        }
    });

    /**
     *
     */
    return {
        __esModule: true,
        ...originalModule,
        StoreWrapper: jest.fn().mockImplementation(() => originalModule.StoreWrapper),
        Store: {
            instance: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                globalStore: storeFactory(originalModule.Store.instance.globalStore),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                localStore: storeFactory(originalModule.Store.instance.localStore),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                testStore: storeFactory(originalModule.Store.instance.testStore),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                stepStore: storeFactory(originalModule.Store.instance.stepStore)
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
    expect(sut.scoped).toBe(ScopedType.False);

    sut.replace({
        match: null,
        qualifier: {
            optional: false,
            stringValue: 'yyyy',
            value: 'yyyy',
            paras: null
        }
    });

    // eslint-disable-next-line jest/unbound-method
    const getter = EnvLoader.instance.get;
    expect(getter).toHaveBeenCalledWith('yyyy', null, true);
});

/**
 *
 */
it('check text replacer', () => {
    const sut: ValueReplacer = new TextReplacer();

    expect(sut.name).toBe('text');
    sut.replace({
        match: null,
        qualifier: {
            optional: false,
            stringValue: '',
            value: 'xxxx',
            paras: null
        }
    });

    // eslint-disable-next-line jest/unbound-method
    const getter = TextLanguageHandler.instance.get;
    expect(getter).toHaveBeenCalledWith('xxxx');
});

/**
 *
 */
describe('generate', () => {
    /**
     *
     */
    it('default', () => {
        const sut = new GenerateReplacer();
        const store = Store.instance.testStore;

        sut.replace(
            {
                match: null,
                qualifier: {
                    optional: false,
                    stringValue: 'xxxx',
                    value: 'xxxx',
                    paras: null
                }
            },
            store
        );

        // eslint-disable-next-line jest/unbound-method
        const generater = GeneratorHandler.instance.generate;

        expect(generater).toHaveBeenCalledWith('xxxx');
        expect(store.store.get).toHaveBeenCalledWith({
            match: '#generate#:#test store#:#xxxx#',
            qualifier: {
                optional: false,
                paras: [],
                stringValue: '#generate#:#test store#:#xxxx#',
                value: '#generate#:#test store#:#xxxx#'
            }
        });
    });

    /**
     *
     */
    it('with arguments', () => {
        const sut: ValueReplacer = new GenerateReplacer();
        const store = Store.instance.testStore;

        sut.replace(
            {
                match: null,
                qualifier: {
                    optional: false,
                    stringValue: 'xxxx:arg1:arg2',
                    value: 'xxxx',
                    paras: ['arg1', 'arg2']
                }
            },
            store
        );

        // eslint-disable-next-line jest/unbound-method
        const generater = GeneratorHandler.instance.generate;

        expect(generater).toHaveBeenCalledWith('xxxx:arg1:arg2');
        expect(store.store.get).toHaveBeenCalledWith({
            match: '#generate#:#test store#:#xxxx:arg1:arg2#',
            qualifier: {
                optional: false,
                paras: [],
                stringValue: '#generate#:#test store#:#xxxx:arg1:arg2#',
                value: '#generate#:#test store#:#xxxx:arg1:arg2#'
            }
        });
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
        const sut = new ReferenceReplacer();
        const store = Store.instance.testStore;

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.True);

        sut.replace(
            {
                match: null,
                qualifier: {
                    optional: false,
                    stringValue: '',
                    value: 'x',
                    paras: ['x-x', '-x-x']
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: '_y-yyy2',
                        optional: false
                    }
                ]
            },
            store
        );

        // eslint-disable-next-line jest/unbound-method
        const getter = ReferenceHandler.getProperty;

        expect(getter).toHaveBeenCalledWith('x/x-x/-x-x', '_y-yyy2');
        expect(store.store.get).toHaveBeenCalledWith({
            match: '#ref#:#x/x-x/-x-x#_y-yyy2#',
            qualifier: { optional: false, paras: [], stringValue: '#ref#:#x/x-x/-x-x#_y-yyy2#', value: '#ref#:#x/x-x/-x-x#_y-yyy2#' }
        });
    });

    /**
     *
     */
    it('check reference replacer (not valid property)', () => {
        const sut = new ReferenceReplacer();
        const store = Store.instance.testStore;

        jest.spyOn(store.store, 'get').mockImplementation(() => 'anything');

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.True);

        const value = sut.replace(
            {
                match: null,
                qualifier: {
                    optional: false,
                    stringValue: '',
                    value: 'xxxxx',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'yyyy',
                        optional: false
                    }
                ]
            },
            store
        );

        expect(value).toBe('anything');
        expect(store.store.get).toHaveBeenCalledWith({
            match: '#ref#:#xxxxx#yyyy#',
            qualifier: { optional: false, paras: [], stringValue: '#ref#:#xxxxx#yyyy#', value: '#ref#:#xxxxx#yyyy#' }
        });
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
        const sut = new StoreReplacer();
        const store = Store.instance.testStore;

        expect(sut.name).toBe('store');
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.Optional);

        const replacedValue = sut.replace(
            {
                match: null,
                qualifier: {
                    optional: false,
                    stringValue: '',
                    value: 'xxxxx',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'yyyy',
                        optional: true
                    }
                ]
            },
            store
        );

        expect(replacedValue).toBeUndefined();
    });

    /**
     *
     */
    it('no scope - value defined', () => {
        const ast = variableParser.parseAction('store:x');
        Store.instance.testStore.put(ast, 1);

        const sut = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace(ast, store);

        expect(replacedValue).toBe('1');
    });

    /**
     *
     */
    it('replacement with global (suite) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.globalStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 1);

        const replacedValue = sut.replace(ast, store);

        expect(replacedValue).toBe('1');
        expect(Store.instance.globalStore.get).toHaveBeenCalledWith({
            datascope: null,
            errs: null,
            match: 'store:a',
            name: { stringValue: 'store:a', value: 'store' },
            qualifier: { optional: false, paras: [], selectorMatch: 'a', stringValue: 'a', value: 'a' },
            scope: null,
            selectors: []
        });
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

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 2);

        const replacedValue = sut.replace(ast, store);

        expect(replacedValue).toBe('2');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/prefer-called-with
        expect(Store.instance.localStore.get).toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('replacement with test (scenario) scope', () => {
        const sut = new StoreReplacer();
        const store = Store.instance.testStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 3);

        const replacedValue = sut.replace(ast, store);

        expect(replacedValue).toBe('3');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/prefer-called-with
        expect(Store.instance.testStore.get).toHaveBeenCalled();
        expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
    });

    /**
     *
     */
    it('replacement with step (step) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.stepStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 4);

        const replacedValue = sut.replace(ast, store);

        expect(replacedValue).toBe('4');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/prefer-called-with
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });

    /**
     *
     */
    it('no scope, variable in global', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.globalStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 1);

        const replacedValue = sut.replace(ast);

        expect(replacedValue).toBe('1');

        const calledStructure = {
            datascope: null,
            errs: null,
            match: 'store:a',
            name: { stringValue: 'store:a', value: 'store' },
            qualifier: { optional: false, paras: [], selectorMatch: 'a', stringValue: 'a', value: 'a' },
            scope: null,
            selectors: []
        };
        expect(Store.instance.globalStore.get).toHaveBeenCalledWith(calledStructure);
        expect(Store.instance.localStore.get).toHaveBeenCalledWith(calledStructure);
        expect(Store.instance.testStore.get).toHaveBeenCalledWith(calledStructure);
        expect(Store.instance.stepStore.get).toHaveBeenCalledWith(calledStructure);
    });

    /**
     *
     */
    it('no scope, variable in local', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.localStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 2);

        const replacedValue = sut.replace(ast);

        expect(replacedValue).toBe('2');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();

        const calledStructure = {
            datascope: null,
            errs: null,
            match: 'store:a',
            name: { stringValue: 'store:a', value: 'store' },
            qualifier: { optional: false, paras: [], selectorMatch: 'a', stringValue: 'a', value: 'a' },
            scope: null,
            selectors: []
        };
        expect(Store.instance.localStore.get).toHaveBeenCalledWith(calledStructure);
        expect(Store.instance.testStore.get).toHaveBeenCalledWith(calledStructure);
        expect(Store.instance.stepStore.get).toHaveBeenCalledWith(calledStructure);
    });

    /**
     *
     */
    it('no scope, variable in test', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 3);

        const replacedValue = sut.replace(ast);

        expect(replacedValue).toBe('3');

        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();

        const calledStructure = {
            datascope: null,
            errs: null,
            match: 'store:a',
            name: { stringValue: 'store:a', value: 'store' },
            qualifier: { optional: false, paras: [], selectorMatch: 'a', stringValue: 'a', value: 'a' },
            scope: null,
            selectors: []
        };
        expect(Store.instance.testStore.get).toHaveBeenCalledWith(calledStructure);
        expect(Store.instance.stepStore.get).toHaveBeenCalledWith(calledStructure);
    });

    /**
     *
     */
    it('no scope, variable in step', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.stepStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, 4);

        const replacedValue = sut.replace(ast);

        expect(replacedValue).toBe('4');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();

        const calledStructure = {
            datascope: null,
            errs: null,
            match: 'store:a',
            name: { stringValue: 'store:a', value: 'store' },
            qualifier: { optional: false, paras: [], selectorMatch: 'a', stringValue: 'a', value: 'a' },
            scope: null,
            selectors: []
        };
        expect(Store.instance.stepStore.get).toHaveBeenCalledWith(calledStructure);
    });

    /**
     *
     */
    it('qualifier and scope', () => {
        const sut: ValueReplacer = new StoreReplacer();

        const store = Store.instance.stepStore;

        const ast = variableParser.parseAction('store:a');
        store.put(ast, { b: 11 });

        const replacedValue = sut.replace(variableParser.parseAction('store:a#b'));
        expect(replacedValue).toBe('11');

        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();

        const calledStructure = {
            datascope: null,
            errs: null,
            match: 'store:a#b',
            name: { stringValue: 'store:a', value: 'store' },
            qualifier: { optional: false, paras: [], selectorMatch: 'a#b', stringValue: 'a', value: 'a' },
            scope: null,

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            selectors: expect.any(Array)
        };

        expect(Store.instance.stepStore.get).toHaveBeenCalledWith(calledStructure);
    });
});
