import { Store } from '../store/Store';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

import { ValueReplacer } from './ValueReplacer';
import { ValueReplacerHandler } from './ValueReplacerHandler';

/**
 *
 */
jest.mock('../store/Store', () => {
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

    return {
        Store: {
            instance: {
                globalStore: storeFactory(suiteMap),
                localStore: storeFactory(specMap),
                testStore: storeFactory(scenarioMap),
                stepStore: storeFactory(stepMap)
            }
        }
    };
});

/**
 *
 */
class NamedValueReplacerMock implements ValueReplacer {
    constructor(private _name: string) {}

    get name() {
        return this._name;
    }
    priority = 100;
    scoped = ScopedType.true;
    replace = jest.fn((property: string) => `#${property}#`);
}

/**
 *
 */
class ValueReplacerMock implements ValueReplacer {
    get name() {
        return 'ValueReplacerMock';
    }
    priority = 100;
    scoped = ScopedType.true;
    replace = jest.fn((property: string): string | null | undefined => `#${property}#`);
}

/**
 *
 */
class StoreReplacerMock extends ValueReplacerMock {
    get name() {
        return 'StoreReplacerMock';
    }
}

/**
 *
 */
class NullableReplacerMock extends ValueReplacerMock {
    nullable = true;
    constructor(private value: string | null | undefined, private printProperty: boolean) {
        super();
    }
    get name() {
        return 'NullReplacerMock';
    }
    replace = jest.fn((property: string) => {
        if (this.printProperty) {
            return `${property}:${this.value || ''}`;
        } else {
            return this.value;
        }
    });
}

class StoreReplacerNoMatchMock implements ValueReplacer {
    readonly name = 'StoreReplacerNoMatchMock';
    priority = 100;
    scoped = ScopedType.true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    replace = jest.fn((_p: string) => null);
}

const sut = ValueReplacerHandler.instance;

/**
 *
 */
beforeEach(() => {
    sut.clear();
    Store.instance.globalStore.clear();
    Store.instance.localStore.clear();
    Store.instance.testStore.clear();
    Store.instance.stepStore.clear();
});

/**
 *
 */
describe('check common functionality', () => {
    /**
     *
     */
    it('adding and removing replacers', () => {
        const valueReplace = new ValueReplacerMock();

        sut.add('test', valueReplace);

        let replacedValue = sut.replace('--${test:a}--');
        expect(replacedValue).toBe('--#a#--');

        sut.delete('test');

        replacedValue = sut.replace('--${test:a}--');
        expect(replacedValue).toBe('--${test:a}--');
    });

    /**
     *
     */
    it('no replacement', () => {
        const replacedValue = sut.replace('--${no-replacer:a}--');
        expect(replacedValue).toBe('--${no-replacer:a}--');
    });

    /**
     *
     */
    /**
     *
     */
    it('adding replacers with addItems (check recursive, cascading)', () => {
        const valueReplacerXXX = new NamedValueReplacerMock('xxx');
        const valueReplacerYYY = new NamedValueReplacerMock('yyy');

        sut.addItems([valueReplacerXXX, valueReplacerYYY]);

        let replacedValue = sut.replace('--${xxx:a}--');
        expect(replacedValue).toBe('--#a#--');

        replacedValue = sut.replace('--${yyy:${xxx:a}}--');
        expect(replacedValue).toBe('--##a##--');
    });

    /**
     *
     */
    it('adding replacers with addItems (check linear)', () => {
        const valueReplacerXXX = new NamedValueReplacerMock('xxx');
        const valueReplacerYYY = new NamedValueReplacerMock('yyy');

        sut.addItems([valueReplacerXXX, valueReplacerYYY]);

        const replacedValue = sut.replace('--${yyy:a} ${xxx:b}--');
        expect(replacedValue).toBe('--#a# #b#--');
    });
});

/**
 *
 */
describe('check valueHandler (unscoped)', () => {
    /**
     *
     */
    it('replacement without scope', () => {
        const valueReplacer = new ValueReplacerMock();
        valueReplacer.scoped = ScopedType.false;
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace).toBeCalledWith('a', Store.instance.nullStore, undefined);
    });

    /**
     *
     */
    it('replacement with global (suite) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test:g:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace).toBeCalledWith('a', Store.instance.globalStore, ScopeType.Global);
    });

    /**
     *
     */
    it('replacement with file/local (spec) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test:l:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace).toBeCalledWith('a', Store.instance.localStore, ScopeType.Local);
    });

    /**
     *
     */
    it('replacement with test (scenario) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test:t:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace).toBeCalledWith('a', Store.instance.testStore, ScopeType.Test);
    });

    /**
     *
     */
    it('replacement with step (step) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test:s:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace).toBeCalledWith('a', Store.instance.stepStore, ScopeType.Step);
    });

    /**
     *
     */
    it('replacement multiple values in one text', () => {
        const replacer = new ValueReplacerMock();
        replacer.scoped = ScopedType.multiple;
        sut.add('store', replacer);
        const result = sut.replace('--${store:a}--${store:b}--');

        expect(result).toBe('--#a#--#b#--');
    });
});

/**
 *
 */
describe('check valueHandler (scoped)', () => {
    /**
     *
     */
    it('replacement with multiple scoped (known for step)', () => {
        const replacer = new StoreReplacerMock();
        replacer.scoped = ScopedType.multiple;
        sut.add('store', replacer);

        Store.instance.stepStore.put('e', '#b#');
        const result = sut.replace('--${store:e}--');

        expect(result).toBe('--#e#--');
        expect(replacer.replace).toBeCalledWith('e', Store.instance.nullStore, undefined);
    });

    /**
     *
     */
    it('use multiple replacers with same identifier', () => {
        const replacer = new StoreReplacerMock();
        replacer.scoped = ScopedType.multiple;
        sut.add('store', replacer);

        expect(() => sut.add('store', replacer)).toThrowError(`valueReplacer 'store' already exists!`);
    });

    /**
     *
     */
    it('use multiple replacers with no match', () => {
        const replacer = new StoreReplacerNoMatchMock();
        replacer.scoped = ScopedType.multiple;
        sut.add('store', replacer);
        Store.instance.testStore.store.put('a', '#b#');

        expect(() => sut.replace('--${store:x}--')).toThrowError(`can't find value of 'store:x'`);
    });

    /**
     *
     */
    it('replace values recursively with same replacer', () => {
        const replacer = new StoreReplacerMock();
        replacer.scoped = ScopedType.multiple;
        sut.add('store', replacer);

        const result = sut.replace('--${store:${store:a}}--');

        expect(result).toBe('--##a##--');
    });

    /**
     *
     */
    it('replace global value without store replacement', () => {
        const replacer = new ValueReplacerMock();
        sut.add('store', replacer);

        const result = sut.replace('--${store:g:a}--');

        expect(result).toBe('--#a#--');
        expect(replacer.replace).toBeCalledWith('a', Store.instance.globalStore, ScopeType.Global);
    });
});

/**
 *
 */
describe('check valueHandler (nullable)', () => {
    /**
     *
     */
    it('undefined must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(undefined, false);
        sut.add('store', replacer);

        const result = sut.replace('--${store?:x}--');
        expect(result).toBe('--undefined--');
    });

    /**
     *
     */
    it('undefined must throw an error, when nullable but not optional', () => {
        const replacer = new NullableReplacerMock(undefined, false);
        sut.add('store', replacer);

        expect(() => {
            sut.replace('--${store:x}--');
        }).toThrowError("can't find value of 'store:x'");
    });

    /**
     *
     */
    it('null must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(null, false);
        sut.add('store', replacer);

        const result = sut.replace('--${store?:x}--');
        expect(result).toBe('--null--');
    });

    /**
     *
     */
    it('only null must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(null, false);
        sut.add('store', replacer);

        const result = sut.replace('${store?:x}');
        expect(result).toBeNull();
    });

    /**
     *
     */
    it('only undefined must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(undefined, false);
        sut.add('store', replacer);

        const result = sut.replace('${store?:x}');
        expect(result).toBeUndefined();
    });

    /**
     *
     */
    it('null must throw an error, when nullable but not optional', () => {
        const replacer = new NullableReplacerMock(null, false);
        sut.add('store', replacer);

        expect(() => {
            sut.replace('--${store:x}--');
        }).toThrowError("can't find value of 'store:x'");
    });

    /**
     *
     */
    it('string must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock('aaa', false);
        sut.add('store', replacer);

        const result = sut.replace('--${store?:x}--');
        expect(result).toBe('--aaa--');
    });

    /**
     *
     */
    it('string must throw an error, when nullable but not optional', () => {
        const replacer = new NullableReplacerMock('aaa', false);
        sut.add('store', replacer);

        const result = sut.replace('--${store:x}--');
        expect(result).toBe('--aaa--');
    });
});
