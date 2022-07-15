import { fail } from 'assert';

import { DataContent } from '../data/DataContent';
import { NativeContent } from '../data/NativeContent';
import { ObjectContent } from '../data/ObjectContent';
import { TextContent } from '../data/TextContent';

import { Store } from './Store';
import { StoreMap } from './StoreMap';
import { StoreWrapper } from './StoreWrapper';

/**
 *
 */
class MockStore implements StoreMap {
    private map = new Map<string, DataContent>();

    put(key: string, value: DataContent) {
        this.map.set(key, value);
    }

    get(key: string): DataContent {
        return this.map.get(key);
    }

    clear() {
        return this.map.clear();
    }
}

/**
 *
 */
describe('check store', () => {
    let sut: StoreWrapper;

    /**
     *
     */
    beforeEach(() => {
        sut = new StoreWrapper(new MockStore(), 'test');
    });

    /**
     *
     */
    it('internal store must be mocked store', () => {
        expect(sut.store).toBeInstanceOf(MockStore);
    });

    /**
     *
     */
    it('internal store is plain object', () => {
        sut = new StoreWrapper({}, 'test');
        expect(sut.store.constructor.name).toBe('ObjectWrapper');
    });

    /**
     *
     */
    it('internal store is null', () => {
        sut = new StoreWrapper(null, 'test');
        expect(sut.store.constructor.name).toBe('ObjectWrapper');
    });

    /**
     *
     */
    it('add value to internal store', () => {
        sut = new StoreWrapper(null, 'test');
        sut.put('a', 'b');
        expect(sut.get('a').toString()).toBe('b');
    });

    /**
     *
     */
    it('clear values from internal store', () => {
        sut = new StoreWrapper(null, 'test');
        sut.put('a', 'b');
        sut.clear();
        expect(() => sut.get('a')).toThrowError(`getting "a" not possible, because it does not exist`);
    });

    /**
     *
     */
    it('get simple string', () => {
        sut.put('a', 'b');
        expect(sut.get('a')).toBeInstanceOf(TextContent);
        expect(sut.get('a').toString()).toBe('b');
    });

    /**
     *
     */
    it('get object from store (first level)', () => {
        sut.put('a', { b: 'c' });
        expect(sut.get('a').toJSON()).toBe('{"b":"c"}');
    });

    /**
     *
     */
    it('get object from store (first level), plain store', () => {
        sut = new StoreWrapper({}, 'test');
        sut.put('a', { b: 'c' });
        expect(sut.get('a').toJSON()).toBe('{"b":"c"}');
    });

    /**
     *
     */
    it('get object from store (second level)', () => {
        sut.put('a', { b: 'c' });
        expect(sut.get('a#b').toJSON()).toBe('"c"');
    });

    /**
     *
     */
    it('get object from store (string, text content)', () => {
        sut.put('a', new TextContent('c'));
        expect(sut.get('a').toJSON()).toBe('"c"');
    });

    /**
     *
     */
    it('get object from store (string, object content)', () => {
        sut.put('a', new ObjectContent('c'));
        expect(sut.get('a').toString()).toBe('c');
    });

    /**
     *
     */
    it('get deep structure from string value', () => {
        sut.put('a', 'b');

        try {
            sut.get('a.b.c');
        } catch (error) {
            expect(error.message).toBe('getting "a.b.c" not possible, because it\'s not an object or an array');
            return;
        }
        fail('expection was not thrown');
    });

    /**
     *
     */
    it('get as string must return a string', () => {
        sut.put('a', 'b');

        const value = sut.get('a').toString();
        if (typeof value !== 'string') {
            fail(`return type must be of type 'string'`);
        }
    });

    /**
     *
     */
    it('set object value', () => {
        sut.put('a#b', new TextContent('hallo'));
        expect(sut.get('a#b').toString()).toBe('hallo');
    });

    /**
     *
     */
    it('set object value (deep, string)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new TextContent('hallo'));
        valB.set('b', valC);

        sut.put('a', valB);

        expect(sut.get('a#b#c').getText()).toBe('hallo');
        expect(sut.get('a').toJSON()).toBe('{"b":{"c":"hallo"}}');
    });

    /**
     *
     */
    it('set object value (deep, number)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new NativeContent(1));
        valB.set('b', valC);

        sut.put('a', valB);

        expect(sut.get('a#b#c').getText()).toBe('1');
        expect(sut.get('a').toJSON()).toBe('{"b":{"c":1}}');
    });

    /**
     *
     */
    it('set object value (deep, boolean - true)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new NativeContent(true));
        valB.set('b', valC);

        sut.put('a', valB);

        expect(sut.get('a.b.c').getText()).toBe('true');
        expect(sut.get('a').toJSON()).toBe('{"b":{"c":true}}');
    });

    /**
     *
     */
    it('set object value (deep, boolean - false)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new NativeContent(false));
        valB.set('b', valC);

        sut.put('a', valB);

        expect(sut.get('a#b#c').getText()).toBe('false');
        expect(sut.get('a').toJSON()).toBe('{"b":{"c":false}}');
    });

    /**
     *
     */
    it('set object value (structure)', () => {
        sut.put('var.a', new NativeContent(1));
        sut.put('var.b', new NativeContent(2));

        expect(sut.get('var').getText()).toBe('{"a":1,"b":2}');
    });

    /**
     *
     */
    it('try setting with empty string', () => {
        try {
            sut.put('', 'a');
        } catch (error) {
            expect(error.message).toBe('name must be defined for saving value in storage');
            return;
        }

        throw Error('error must occur');
    });

    /**
     *
     */
    it('try getting none existing value', () => {
        try {
            sut.get('a');
        } catch (error) {
            expect(error.message).toBe(`getting "a" not possible, because it does not exist`);
            return;
        }

        throw Error('error must occur');
    });

    /**
     *
     */
    it('try getting with empty string', () => {
        try {
            sut.get('');
        } catch (error) {
            expect(error.message).toBe(`name must be defined for getting value from storage`);
            return;
        }

        throw Error('error must occur');
    });

    /**
     *
     */
    it('try getting with null', () => {
        try {
            sut.get(null);
        } catch (error) {
            expect(error.message).toBe(`name must be defined for getting value from storage`);
            return;
        }

        throw Error('error must occur');
    });

    /**
     *
     */
    it('try getting with undefined', () => {
        try {
            sut.get(undefined);
        } catch (error) {
            expect(error.message).toBe(`name must be defined for getting value from storage`);
            return;
        }

        throw Error('error must occur');
    });

    /**
     *
     */
    it('clear store', () => {
        sut.put('a', 'b');
        expect(sut.get('a').toString()).toEqual('b');

        sut.clear();
        try {
            sut.get('a');
        } catch (error) {
            expect(error.message).toBe(`getting "a" not possible, because it does not exist`);
            return;
        }

        throw Error('error must occur');
    });

    /**
     *
     */
    it('get wrappers by scope', () => {
        let store = StoreWrapper.getWrapperByScope('g');
        expect(store).toStrictEqual(Store.instance.globalStore);

        store = StoreWrapper.getWrapperByScope('l');
        expect(store).toStrictEqual(Store.instance.localStore);

        store = StoreWrapper.getWrapperByScope('t');
        expect(store).toStrictEqual(Store.instance.testStore);

        store = StoreWrapper.getWrapperByScope('s');
        expect(store).toStrictEqual(Store.instance.stepStore);
    });
});
