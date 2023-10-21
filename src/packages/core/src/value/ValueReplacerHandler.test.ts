import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

import { ValueReplaceArg, ValueReplacer } from './ValueReplacer';
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
    constructor(
        private _name: string,
        private _value = null
    ) {}

    get name() {
        return this._name;
    }
    config = {};
    priority = 100;
    scoped = ScopedType.true;
    replace = jest.fn((property: string) => `#${property}#`);
    replace2 = jest.fn((ast: ValueReplaceArg) => (this._value ? this._value : `#${ast.qualifier.value}#`));
}

/**
 *
 */
class ValueReplacerMock implements ValueReplacer {
    get name() {
        return 'ValueReplacerMock';
    }
    config = {};
    priority = 100;
    scoped = ScopedType.true;
    replace = jest.fn((property: string): string | null | undefined => `#${property}#`);
    replace2 = jest.fn((ast: ValueReplaceArg, store: StoreWrapper) => {
        return ast.qualifier ? `#${ast.qualifier.value}#` : undefined;
    });
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
    constructor(
        private value: string | null | undefined,
        private printProperty: boolean
    ) {
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
    replace2 = jest.fn((ast: ValueReplaceArg, store: StoreWrapper) => {
        if (this.printProperty) {
            return `${ast.qualifier.stringValue}:${this.value || ''}`;
        } else {
            return this.value;
        }
    });
}

class StoreReplacerNoMatchMock implements ValueReplacer {
    readonly name = 'StoreReplacerNoMatchMock';
    config = {};
    priority = 100;
    scoped = ScopedType.true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    replace = jest.fn((_p: string) => null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    replace2 = jest.fn((_ast: ValueReplaceArg) => null);
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
        const valueReplacerXXX = new NamedValueReplacerMock('xxx', 'aaa');
        const valueReplacerYYY = new NamedValueReplacerMock('yyy');

        sut.addItems([valueReplacerXXX, valueReplacerYYY]);

        let replacedValue = sut.replace('--${xxx:a}--');
        expect(replacedValue).toBe('--aaa--');

        replacedValue = sut.replace('--${yyy:${xxx:a}}--');
        expect(replacedValue).toBe('--#aaa#--');
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
        expect(valueReplacer.replace2).toHaveBeenLastCalledWith(
            expect.objectContaining({
                default: null,
                errs: null,
                match: '${test:a}',
                name: { stringValue: 'test:a', value: 'test' },
                pipes: [],
                qualifier: { paras: [], stringValue: 'a', value: 'a' },
                scope: null
            }),
            null
        );
    });

    /**
     *
     */
    it('replacement with global (suite) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test@g:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace2).toHaveBeenLastCalledWith(
            {
                default: null,
                errs: null,
                match: '${test@g:a}',
                name: { stringValue: 'test:a', value: 'test' },
                pipes: [],
                qualifier: { paras: [], stringValue: 'a', value: 'a' },
                scope: {
                    location: { end: { column: 7, line: 1, offset: 6 }, source: undefined, start: { column: 5, line: 1, offset: 4 } },
                    value: 'g'
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                selectors: expect.anything()
            },
            Store.instance.globalStore
        );
    });

    /**
     *
     */
    it('replacement with file/local (spec) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test@l:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace2).toHaveBeenLastCalledWith(
            {
                default: null,
                errs: null,
                match: '${test@l:a}',
                name: { stringValue: 'test:a', value: 'test' },
                pipes: [],
                qualifier: { paras: [], stringValue: 'a', value: 'a' },
                scope: {
                    location: { end: { column: 7, line: 1, offset: 6 }, source: undefined, start: { column: 5, line: 1, offset: 4 } },
                    value: 'l'
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                selectors: expect.anything()
            },
            Store.instance.localStore
        );
    });

    /**
     *
     */
    it('replacement with test (scenario) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test@t:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace2).toHaveBeenLastCalledWith(
            {
                default: null,
                errs: null,
                match: '${test@t:a}',
                name: { stringValue: 'test:a', value: 'test' },
                pipes: [],
                qualifier: { paras: [], stringValue: 'a', value: 'a' },
                scope: {
                    location: { end: { column: 7, line: 1, offset: 6 }, source: undefined, start: { column: 5, line: 1, offset: 4 } },
                    value: 't'
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                selectors: expect.anything()
            },
            Store.instance.testStore
        );
    });

    /**
     *
     */
    it('replacement with step (step) scope', () => {
        const valueReplacer = new ValueReplacerMock();
        sut.add('test', valueReplacer);
        const replacedValue = sut.replace('--${test@s:a}--');

        expect(replacedValue).toBe('--#a#--');
        expect(valueReplacer.replace2).toHaveBeenLastCalledWith(
            {
                default: null,
                errs: null,
                match: '${test@s:a}',
                name: { stringValue: 'test:a', value: 'test' },
                pipes: [],
                qualifier: { paras: [], stringValue: 'a', value: 'a' },
                scope: {
                    location: { end: { column: 7, line: 1, offset: 6 }, source: undefined, start: { column: 5, line: 1, offset: 4 } },
                    value: 's'
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                selectors: expect.anything()
            },
            Store.instance.stepStore
        );
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
describe('check valueHandler (nullable, optional)', () => {
    /**
     *
     */
    it('undefined must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(undefined, false);
        sut.add('store', replacer);

        const result = sut.replace('--${store?#x}--');
        expect(result).toBe('--null--');
    });

    /**
     *
     */
    xit('undefined must throw an error, when nullable but not optional', () => {
        const replacer = new NullableReplacerMock(undefined, false);
        sut.add('store', replacer);

        expect(() => sut.replace('--${store:x}--')).toThrow("can't find value of 'store:x'");
    });

    /**
     *
     */
    it('null must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(null, false);
        sut.add('store', replacer);

        const result = sut.replace('--${store?#x}--');
        expect(result).toBe('--null--');
    });

    /**
     *
     */
    it('only null must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(null, false);
        sut.add('store', replacer);

        const result = sut.replace('${store?#x}');
        expect(result).toBeNull();
    });

    /**
     *
     */
    it('only undefined must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock(undefined, false);
        sut.add('store', replacer);

        const result = sut.replace('${store?#x}');
        expect(result).toBeNull();
    });

    /**
     *
     */
    xit('null must throw an error, when nullable but not optional', () => {
        const replacer = new NullableReplacerMock(null, false);
        sut.add('store', replacer);

        expect(() => {
            sut.replace('--${store:x}--');
        }).toThrow("can't find value of 'store:x'");
    });

    /**
     *
     */
    it('string must be allowed, when nullable and optional', () => {
        const replacer = new NullableReplacerMock('aaa', false);
        sut.add('store', replacer);

        const result = sut.replace('--${store?#x}--');
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

    /**
     *
     */
    it('value can be empty', () => {
        const replacer = new NullableReplacerMock('', false);
        sut.add('store', replacer);

        const result = sut.replace('--${store:x}--');
        expect(result).toBe('----');
    });
});
