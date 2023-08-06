/* eslint-disable @typescript-eslint/unbound-method */
import {
    ASTSelectorType,
    EnvLoader,
    GeneratorHandler,
    OperatorType,
    ScopedType,
    Store,
    StoreWrapper,
    TextLanguageHandler,
    ValueReplacer
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
                globalStore: storeFactory(originalModule.Store.instance.globalStore),
                localStore: storeFactory(originalModule.Store.instance.localStore),
                testStore: storeFactory(originalModule.Store.instance.testStore),
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
    expect(sut.scoped).toBe(ScopedType.false);

    sut.replace2({
        qualifier: {
            value: 'yyyy',
            paras: null
        }
    });

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
    sut.replace2({
        qualifier: {
            value: 'xxxx',
            paras: null
        }
    });

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
        const sut = new GenerateReplacer();
        const store = Store.instance.testStore;

        sut.replace2(
            {
                qualifier: {
                    value: 'xxxx',
                    paras: null
                }
            },
            store
        );

        const generater = GeneratorHandler.instance.generate;

        expect(generater).toBeCalled();
        expect(generater).toBeCalledWith('xxxx');
        expect(store.store.get).toBeCalledWith('#generate#:#test store#:#xxxx#');
    });

    /**
     *
     */
    it('with arguments', () => {
        const sut: ValueReplacer = new GenerateReplacer();
        const store = Store.instance.testStore;

        sut.replace2(
            {
                qualifier: {
                    value: 'xxxx',
                    paras: ['arg1', 'arg2']
                }
            },
            store
        );

        const generater = GeneratorHandler.instance.generate;

        expect(generater).toBeCalled();
        expect(generater).toBeCalledWith('xxxx:arg1:arg2');
        expect(store.store.get).toBeCalledWith('#generate#:#test store#:#xxxx:arg1:arg2#');
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
        expect(sut.scoped).toBe(ScopedType.true);

        sut.replace2(
            {
                qualifier: {
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

        const getter = ReferenceHandler.getProperty;
        expect(getter).toBeCalled();
        expect(getter).toBeCalledWith('x/x-x/-x-x', '_y-yyy2');

        expect(store.store.get).toBeCalledWith('#ref#:#x/x-x/-x-x#_y-yyy2#');
    });

    /**
     *
     */
    it('check reference replacer (not valid property)', () => {
        const sut = new ReferenceReplacer();
        const store = Store.instance.testStore;

        store.store.get = jest.fn((key: string) => 'anything');

        expect(sut.name).toBe('ref');
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        const value = sut.replace2(
            {
                qualifier: {
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

        const getter = ReferenceHandler.getProperty;
        expect(getter).not.toBeCalled();
        expect(value).toBe('anything');
        expect(store.store.get).toBeCalledWith('#ref#:#xxxxx#yyyy#');
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
        expect(sut.scoped).toBe(ScopedType.multiple);

        const replacedValue = sut.replace2(
            {
                qualifier: {
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
    it('with default, no scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: 'xxxxx',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'yyyy',
                        optional: false
                    }
                ],
                default: {
                    value: 'default',
                    operator: OperatorType.Default
                }
            },
            store
        );

        expect(replacedValue).toBe('default');
    });

    /**
     *
     */
    it('with default -> undefined', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: 'xxxxx',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'yyyy',
                        optional: false
                    }
                ],
                default: {
                    value: 'undefined',
                    operator: OperatorType.Default
                }
            },
            store
        );

        expect(replacedValue).toBe('undefined');
    });

    /**
     *
     */
    it('no scope - value defined', () => {
        Store.instance.testStore.put('x', 1);
        const sut = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'x',
                        optional: false
                    }
                ]
            },
            store
        );

        expect(replacedValue).toBe('1');
    });

    /**
     *
     */
    it('no scope - use assign operator', () => {
        const sut = new StoreReplacer();
        const store = Store.instance.testStore;

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'x',
                        optional: false
                    }
                ],
                default: {
                    value: '2',
                    operator: OperatorType.DefaultAssignment
                }
            },
            store
        );

        expect(replacedValue).toBe('2');
        expect(store.get('x')).toBeDefined();
        expect(store.get('x').valueOf()).toBe(2);
    });

    /**
     *
     */
    it('no scope - use assign operator with store attribute', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.testStore;

        // const replacedValue = sut.replace('x#y:=2', store);
        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'x',
                        optional: false
                    },
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'y',
                        optional: false
                    }
                ],
                default: {
                    value: '2',
                    operator: OperatorType.DefaultAssignment
                }
            },
            store
        );

        expect(replacedValue).toBe('2');
        expect(store.put).toHaveBeenCalled();
        expect(store.put).toHaveBeenCalledWith('x.y', '2');
    });

    /**
     *
     */
    it('replacement with global (suite) scope', () => {
        const sut: ValueReplacer = new StoreReplacer();
        const store = Store.instance.globalStore;
        store.put('a', 1);

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'a',
                        optional: false
                    }
                ]
            },
            store
        );

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

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'a',
                        optional: false
                    }
                ]
            },
            store
        );

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
        const sut = new StoreReplacer();
        const store = Store.instance.testStore;
        store.put('a', 3);

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'a',
                        optional: false
                    }
                ]
            },
            store
        );

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

        const replacedValue = sut.replace2(
            {
                qualifier: {
                    value: '',
                    paras: null
                },
                selectors: [
                    {
                        type: ASTSelectorType.SIMPLE,
                        value: 'a',
                        optional: false
                    }
                ]
            },
            store
        );

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

        const replacedValue = sut.replace2({
            qualifier: {
                value: '',
                paras: null
            },
            selectors: [
                {
                    type: ASTSelectorType.SIMPLE,
                    value: 'a',
                    optional: false
                }
            ]
        });

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

        const replacedValue = sut.replace2({
            qualifier: {
                value: '',
                paras: null
            },
            selectors: [
                {
                    type: ASTSelectorType.SIMPLE,
                    value: 'a',
                    optional: false
                }
            ]
        });

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

        const replacedValue = sut.replace2({
            qualifier: {
                value: '',
                paras: null
            },
            selectors: [
                {
                    type: ASTSelectorType.SIMPLE,
                    value: 'a',
                    optional: false
                }
            ]
        });

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

        const replacedValue = sut.replace2({
            qualifier: {
                value: '',
                paras: null
            },
            selectors: [
                {
                    type: ASTSelectorType.SIMPLE,
                    value: 'a',
                    optional: false
                }
            ]
        });

        expect(replacedValue).toBe('4');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });

    /**
     *
     */
    it('qualifier and scope', () => {
        const sut: ValueReplacer = new StoreReplacer();

        const store = Store.instance.stepStore;
        store.put('a', { b: 11 });

        const replacedValue = sut.replace2({
            qualifier: {
                value: 'a',
                paras: null
            },
            selectors: [
                {
                    type: ASTSelectorType.SIMPLE,
                    value: 'b',
                    optional: false
                }
            ]
        });

        expect(replacedValue).toBe('11');
        expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
        expect(Store.instance.localStore.get).not.toHaveBeenCalled();
        expect(Store.instance.testStore.get).not.toHaveBeenCalled();
        expect(Store.instance.stepStore.get).toHaveBeenCalled();
    });
});
