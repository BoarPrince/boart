/* eslint-disable @typescript-eslint/unbound-method */
import { Store } from '../store/Store';
import { ScopedType } from '../types/ScopedType';

import { ValueReplacer } from './ValueReplacer';
import { ValueReplacerHandler } from './ValueReplacerHandler';

jest.mock('../store/Store', () => {
    const suiteMap = new Map<string, string>();
    const specMap = new Map<string, string>();
    const scenarioMap = new Map<string, string>();
    const stepMap = new Map<string, string>();
    return {
        Store: {
            instance: {
                globalStore: {
                    clear: () => suiteMap.clear(),
                    put: jest.fn((key: string, value: string) => suiteMap.set(key, value)),
                    get: jest.fn((key: string) => suiteMap.get(key))
                },
                localStore: {
                    clear: () => specMap.clear(),
                    put: jest.fn((key: string, value: string) => specMap.set(key, value)),
                    get: jest.fn((key: string) => specMap.get(key))
                },
                testStore: {
                    clear: () => scenarioMap.clear(),
                    put: jest.fn((key: string, value: string) => scenarioMap.set(key, value)),
                    get: jest.fn((key: string) => scenarioMap.get(key))
                },
                stepStore: {
                    clear: () => stepMap.clear(),
                    put: jest.fn((key: string, value: string) => stepMap.set(key, value)),
                    get: jest.fn((key: string) => stepMap.get(key))
                }
            }
        }
    };
});

describe('check valueReplaceHandler', () => {
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
        replace = jest.fn((property: string) => `#${property}#`);
    }

    /**
     *
     */
    class StoreReplacerMock extends ValueReplacerMock {
        getProperty(property: string): string {
            return property;
        }

        get name() {
            return 'StoreReplacerMock';
        }
    }

    class StoreReplacerNoMatchMock implements ValueReplacer {
        readonly name = 'StoreReplacerNoMatchMock';
        priority = 100;
        scoped = ScopedType.true;
        getProperty(property: string): string {
            return property;
        }
        replace = jest.fn(() => null);
    }

    /**
     *
     */
    class ValueReplacerMockWithProperty extends ValueReplacerMock {
        constructor(private propName: string) {
            super();
        }

        getProperty(): string {
            return this.propName;
        }
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
        /**
         *
         */
        it('adding replacers with addItems (check recursive)', () => {
            const valueReplacerXXX = new NamedValueReplacerMock('xxx');
            const valueReplacerYYY = new NamedValueReplacerMock('yyy');

            sut.addItems([valueReplacerXXX, valueReplacerYYY]);

            const replacedValue = sut.replace('--${yyy:${xxx:a}}--');
            expect(replacedValue).toBe('--##a##--');
        });

        /**
         *
         */
        /**
         *
         */
        it('adding replacers with addItems (check linear)', () => {
            const valueReplacerXXX = new NamedValueReplacerMock('xxx');
            const valueReplacerYYY = new NamedValueReplacerMock('yyy');

            sut.addItems([valueReplacerXXX, valueReplacerYYY]);

            const replacedValue = sut.replace('--${yyy:a} ${xxx:a}--');
            expect(replacedValue).toBe('--#a# #a#--');
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
            const valueReplace = new ValueReplacerMock();
            valueReplace.scoped = ScopedType.false;
            sut.add('test', valueReplace);
            const replacedValue = sut.replace('--${test:a}--');

            expect(replacedValue).toBe('--#a#--');
            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).not.toHaveBeenCalled();
            expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
        });

        /**
         *
         */
        it('replacement with global (suite) scope', () => {
            sut.add('test', new ValueReplacerMock());
            const replacedValue = sut.replace('--${test:g:a}--');

            expect(replacedValue).toBe('--#a#--');
            expect(Store.instance.globalStore.get).toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).not.toHaveBeenCalled();
            expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
        });

        /**
         *
         */
        it('replacement with file/local (spec) scope', () => {
            sut.add('test', new ValueReplacerMock());
            const replacedValue = sut.replace('--${test:l:a}--');

            expect(replacedValue).toBe('--#a#--');
            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).toHaveBeenCalled();
            expect(Store.instance.testStore.get).not.toHaveBeenCalled();
            expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
        });

        /**
         *
         */
        it('replacement with test (scenario) scope', () => {
            sut.add('test', new ValueReplacerMock());
            const replacedValue = sut.replace('--${test:t:a}--');

            expect(replacedValue).toBe('--#a#--');
            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).toHaveBeenCalled();
            expect(Store.instance.stepStore.get).not.toHaveBeenCalled();
        });

        /**
         *
         */
        it('replacement with step (step) scope', () => {
            sut.add('test', new ValueReplacerMock());
            const replacedValue = sut.replace('--${test:s:a}--');

            expect(replacedValue).toBe('--#a#--');
            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).not.toHaveBeenCalled();
            expect(Store.instance.stepStore.get).toHaveBeenCalled();
        });

        /**
         *
         */
        it('replacement with storeIdentifier', () => {
            sut.add('test', new ValueReplacerMock());
            const result = sut.replace('--${test:l:a}--');

            expect(Store.instance.localStore.get).toBeCalledWith('#test#:#a#');
            expect(result).toBe('--#a#--');
        });

        /**
         *
         */
        it('replacement with property definition', () => {
            sut.add('test', new ValueReplacerMockWithProperty('prop'));
            sut.replace('--${test:l:a}--');

            expect(Store.instance.localStore.get).toBeCalledWith('prop');
        });

        /**
         *
         */
        it('replacement with multiple scoped (not yet known)', () => {
            const replacer = new ValueReplacerMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);
            const result = sut.replace('--${store:a}--');

            expect(Store.instance.localStore.get).toBeCalledWith('#store#:#a#');
            expect(Store.instance.globalStore.get).toBeCalledWith('#store#:#a#');
            expect(Store.instance.testStore.get).toBeCalledWith('#store#:#a#');
            expect(Store.instance.stepStore.get).toBeCalledWith('#store#:#a#');

            expect(result).toBe('--#a#--');
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

            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).not.toHaveBeenCalled();
            expect(Store.instance.stepStore.get).toBeCalledWith('e');

            expect(result).toBe('--#b#--');
        });

        /**
         *
         */
        it('replacement with multiple scoped (known for scenario)', () => {
            const replacer = new StoreReplacerMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);

            Store.instance.testStore.put('a', '#b#');
            const result = sut.replace('--${store:a}--');

            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).toBeCalledWith('a');
            expect(Store.instance.stepStore.get).toBeCalledWith('a');

            expect(result).toBe('--#b#--');
        });

        /**
         *
         */
        it('replacement with multiple scoped (known for spec)', () => {
            const replacer = new StoreReplacerMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);

            Store.instance.localStore.put('a', '#b#');
            const result = sut.replace('--${store:a}--');

            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).toBeCalledWith('a');
            expect(Store.instance.localStore.get).toBeCalledTimes(1);
            expect(Store.instance.testStore.get).toBeCalledWith('a');
            expect(Store.instance.testStore.get).toBeCalledTimes(1);
            expect(Store.instance.stepStore.get).toBeCalledWith('a');
            expect(Store.instance.stepStore.get).toBeCalledTimes(1);

            expect(result).toBe('--#b#--');
        });

        /**
         *
         */
        it('replacement with multiple scoped (known for suite)', () => {
            const replacer = new StoreReplacerMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);

            Store.instance.globalStore.put('a', '#b#');
            const result = sut.replace('--${store:a}--');

            expect(Store.instance.globalStore.get).toBeCalledWith('a');
            expect(Store.instance.globalStore.get).toBeCalledTimes(1);
            expect(Store.instance.localStore.get).toBeCalledWith('a');
            expect(Store.instance.localStore.get).toBeCalledTimes(1);
            expect(Store.instance.testStore.get).toBeCalledWith('a');
            expect(Store.instance.testStore.get).toBeCalledTimes(1);
            expect(Store.instance.stepStore.get).toBeCalledWith('a');
            expect(Store.instance.stepStore.get).toBeCalledTimes(1);

            expect(result).toBe('--#b#--');
        });

        /**
         *
         */
        it('use multiple replacers with different identifiers', () => {
            const replacer = new StoreReplacerMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store3', replacer);
            sut.add('store', replacer);
            sut.add('store2', replacer);

            Store.instance.testStore.put('a', '#b#');
            const result = sut.replace('--${store:a}--');

            expect(Store.instance.globalStore.get).not.toHaveBeenCalled();
            expect(Store.instance.localStore.get).not.toHaveBeenCalled();
            expect(Store.instance.testStore.get).toBeCalledWith('a');
            expect(Store.instance.testStore.get).toBeCalledTimes(1);
            expect(Store.instance.stepStore.get).toBeCalledWith('a');
            expect(Store.instance.stepStore.get).toBeCalledTimes(1);

            expect(result).toBe('--#b#--');
        });

        /**
         *
         */
        it('use multiple replacers with same identifier', () => {
            const replacer = new StoreReplacerMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);

            try {
                sut.add('store', replacer);
            } catch (error) {
                expect(error.message).toBe(`valueReplacer 'store' already exists!`);
                return;
            }

            fail('if adding replacers with the same identifier, an error should thrown.');
        });

        /**
         *
         */
        it('use multiple replacers with no match', () => {
            const replacer = new StoreReplacerNoMatchMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);
            Store.instance.testStore.put('a', '#b#');

            try {
                sut.replace('--${store:x}--');
            } catch (error) {
                expect(error.message).toBe(`can't find value of 'x'`);
                return;
            }

            fail('An error must be thrown if no value can be matched');
        });

        /**
         *
         */
        it('replace values recursively with same replacer', () => {
            const replacer = new StoreReplacerNoMatchMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);

            Store.instance.testStore.put('a', 'b');
            Store.instance.testStore.put('b', 'c');
            const result = sut.replace('--${store:${store:a}}--');

            expect(result).toBe('--c--');
        });

        /**
         *
         */
        it('replace values recursively with different replacers', () => {
            const replacer = new StoreReplacerNoMatchMock();
            replacer.scoped = ScopedType.multiple;
            sut.add('store', replacer);

            const replacer2 = new StoreReplacerNoMatchMock();
            replacer2.scoped = ScopedType.multiple;
            sut.add('test', replacer2);

            Store.instance.globalStore.put('a', 'b');
            Store.instance.testStore.put('b', 'c');

            expect(sut.replace('${test:a}')).toBe('b');
            const result = sut.replace('--${store:${test:a}}--');

            expect(result).toBe('--c--');
        });

        /**
         *
         */
        it('replace global value without store replacement', () => {
            const replacer = new ValueReplacerMock();
            sut.add('store', replacer);

            const result = sut.replace('--${store:g:a}--');

            expect(result).toBe('--#a#--');
        });

        /**
         *
         */
        it('replace global value with store replacement', () => {
            Store.instance.globalStore.put('#store#:#a#', 'b');

            const replacer = new ValueReplacerMock();
            sut.add('store', replacer);

            const result = sut.replace('--${store:g:a}--');

            expect(result).toBe('--b--');
        });
    });
});
