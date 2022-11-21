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

    has(key: string): boolean {
        return this.map.has(key);
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
        expect(sut.get('a')).toBeNull();
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
        const value = sut.get('a').valueOf();
        expect(value).toStrictEqual({ b: 'c' });
        expect(JSON.stringify(value)).toBe('{"b":"c"}');
    });

    /**
     *
     */
    it('get object from store (first level), plain store', () => {
        sut = new StoreWrapper({}, 'test');
        sut.put('a', { b: 'c' });
        expect(sut.get('a').valueOf()).toStrictEqual({ b: 'c' });
    });

    /**
     *
     */
    it('get object from store (second level)', () => {
        sut.put('a', { b: 'c' });
        expect(sut.get('a#b').valueOf()).toStrictEqual('c');
    });

    /**
     *
     */
    it('get object from store (string, text content)', () => {
        sut.put('a', new TextContent('c'));
        expect(sut.get('a').valueOf()).toStrictEqual('c');
    });

    /**
     *
     */
    it('get object from store (string, object content)', () => {
        sut.put('a', new ObjectContent('c'));
        expect(sut.get('a').valueOf()).toStrictEqual('c');
    });

    /**
     *
     */
    it('get deep structure from string value', () => {
        sut.put('a', 'b');

        expect(() => sut.get('a.b.c')).toThrowError('getting "a.b.c" not possible, because "b" is not an object or an array');
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
        sut.put('a.b', new TextContent('hallo'));
        expect(sut.get('a.b').toString()).toBe('hallo');
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

        expect(sut.get('a#b#c').toString()).toBe('hallo');
        expect(sut.get('a').valueOf()).toStrictEqual({ b: { c: 'hallo' } });
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

        expect(sut.get('a#b#c').toString()).toBe('1');
        expect(sut.get('a').valueOf()).toStrictEqual({ b: { c: 1 } });
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

        expect(sut.get('a.b.c').toString()).toBe('true');
        expect(sut.get('a').valueOf()).toStrictEqual({ b: { c: true } });
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

        expect(sut.get('a#b#c').toString()).toBe('false');
        expect(sut.get('a').valueOf()).toStrictEqual({ b: { c: false } });
    });

    /**
     *
     */
    it('set object value (structure)', () => {
        sut.put('var.a', new NativeContent(1));
        sut.put('var.b', new NativeContent(2));

        expect(sut.get('var').toString()).toBe('{"a":1,"b":2}');
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
        expect(sut.get('a')).toBeNull();
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
        expect(sut.get('a')).toBeNull();
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
