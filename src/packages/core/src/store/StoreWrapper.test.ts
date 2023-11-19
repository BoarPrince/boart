import { DataContent } from '../data/DataContent';
import { NativeContent } from '../data/NativeContent';
import { ObjectContent } from '../data/ObjectContent';
import { TextContent } from '../data/TextContent';
import { VariableParser } from '../parser/VariableParser';
import { ValueReplaceArg } from '../value/ValueReplacer';

import { Store } from './Store';
import { StoreMap } from './StoreMap';
import { StoreWrapper } from './StoreWrapper';

/**
 *
 */
const pegParser = new VariableParser();

/**
 *
 */
class MockStore extends StoreMap {
    private map = new Map<string, DataContent>();

    put(ast: ValueReplaceArg, value: DataContent) {
        this.map.set(this.getKey(ast), value);
    }

    get(ast: ValueReplaceArg): DataContent {
        return this.map.get(this.getKey(ast));
    }

    has(ast: ValueReplaceArg): boolean {
        return this.map.has(this.getKey(ast));
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
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, 'b');
        expect(sut.get(ast).toString()).toBe('b');
    });

    /**
     *
     */
    it('clear values from internal store', () => {
        sut = new StoreWrapper(null, 'test');
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, 'b');
        sut.clear();
        expect(sut.get(ast)).toBeNull();
    });

    /**
     *
     */
    it('get simple string', () => {
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, 'b');

        expect(sut.get(ast)).toBeInstanceOf(TextContent);
        expect(sut.get(ast).toString()).toBe('b');
    });

    /**
     *
     */
    it('get object from store (first level)', () => {
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, { b: 'c' });

        const value = sut.get(ast).valueOf();

        expect(value).toStrictEqual({ b: 'c' });
        expect(JSON.stringify(value)).toBe('{"b":"c"}');
    });

    /**
     *
     */
    it('get object from store (first level), plain store', () => {
        const ast = pegParser.parseAction('store:a');
        sut = new StoreWrapper({}, 'test');

        sut.put(ast, { b: 'c' });

        expect(sut.get(ast).valueOf()).toStrictEqual({ b: 'c' });
    });

    /**
     *
     */
    it('get object from store (second level)', () => {
        const ast = pegParser.parseAction('store:a');
        sut.put(ast, { b: 'c' });

        const astGet = pegParser.parseAction('store:a#b');
        expect(sut.get(astGet).valueOf()).toBe('c');
    });

    /**
     *
     */
    it('get object from store (string, text content)', () => {
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, new TextContent('c'));

        expect(sut.get(ast).valueOf()).toBe('c');
    });

    /**
     *
     */
    it('get object from store (string, object content)', () => {
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, new ObjectContent('c'));

        expect(sut.get(ast).valueOf()).toBe('c');
    });

    /**
     *
     */
    it('get deep structure from string value', () => {
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, 'b');

        const astGet = pegParser.parseAction('store:a#b.c');
        expect(() => sut.get(astGet)).toThrow(`store 'a' -> getting "b.c" not possible, because "b" is not an object or an array`);
    });

    /**
     *
     */
    it('get as string must return a string', () => {
        const ast = pegParser.parseAction('store:a');
        sut.put(ast, 'b');

        const value = sut.get(ast).valueOf();

        expect(value).toBeString();
    });

    /**
     *
     */
    it('set object value', () => {
        const ast = pegParser.parseAction('store:a#b');
        sut.put(ast, new TextContent('hallo'));

        expect(sut.get(ast).valueOf()).toBe('hallo');
    });

    /**
     *
     */
    it('set object value (deep, string)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new TextContent('hallo'));
        valB.set('b', valC);

        const ast = pegParser.parseAction('store:a');
        sut.put(ast, valB);

        const astDeep = pegParser.parseAction('store:a#b.c');
        expect(sut.get(astDeep).toString()).toBe('hallo');
        expect(sut.get(ast).valueOf()).toStrictEqual({ b: { c: 'hallo' } });
    });

    /**
     *
     */
    it('set object value (deep, number)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new NativeContent(1));
        valB.set('b', valC);

        const ast = pegParser.parseAction('store:a');
        sut.put(ast, valB);

        const astDeep = pegParser.parseAction('store:a#b.c');
        expect(sut.get(astDeep).toString()).toBe('1');
        expect(sut.get(ast).valueOf()).toStrictEqual({ b: { c: 1 } });
    });

    /**
     *
     */
    it('set object value (deep, boolean - true)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new NativeContent(true));
        valB.set('b', valC);

        const ast = pegParser.parseAction('store:a');
        sut.put(ast, valB);

        const astDeep = pegParser.parseAction('store:a#b.c');
        expect(sut.get(astDeep).toString()).toBe('true');
        expect(sut.get(ast).valueOf()).toStrictEqual({ b: { c: true } });
    });

    /**
     *
     */
    it('set object value (deep, boolean - false)', () => {
        const valB = new ObjectContent();
        const valC = new ObjectContent();

        valC.set('c', new NativeContent(false));
        valB.set('b', valC);

        const ast = pegParser.parseAction('store:a');
        sut.put(ast, valB);

        const astDeep = pegParser.parseAction('store:a#b.c');
        expect(sut.get(astDeep).toString()).toBe('false');
        expect(sut.get(ast).valueOf()).toStrictEqual({ b: { c: false } });
    });

    /**
     *
     */
    it('set object value (structure)', () => {
        const astA = pegParser.parseAction('store:var#a');
        sut.put(astA, new NativeContent(1));

        const astB = pegParser.parseAction('store:var#b');
        sut.put(astB, new NativeContent(2));

        const ast = pegParser.parseAction('store:var');
        expect(sut.get(ast).toString()).toBe('{"a":1,"b":2}');
    });

    /**
     *
     */
    it('try setting with empty string', () => {
        const ast = pegParser.parseAction('store');
        expect(() => sut.put(ast, 'a')).toThrow('qualifier must be defined for identifying the store name');
    });

    /**
     *
     */
    it('try getting none existing value', () => {
        const ast = pegParser.parseAction('store:a');
        expect(sut.get(ast)).toBeNull();
    });

    /**
     *
     */
    it('try getting with null', () => {
        expect(() => sut.get(null)).toThrow(`qualifier must be defined for identifying the store name`);
    });

    /**
     *
     */
    it('try getting with undefined', () => {
        expect(() => sut.get(undefined)).toThrow(`qualifier must be defined for identifying the store name`);
    });

    /**
     *
     */
    it('clear store', () => {
        const ast = pegParser.parseAction('store:a');
        sut.put(ast, 'b');

        expect(sut.get(ast).toString()).toBe('b');

        sut.clear();
        expect(sut.get(ast)).toBeNull();
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
