import { ContentType } from './ContentType';
import { NativeContent } from './NativeContent';
import { NullContent } from './NullContent';
import { ObjectContent } from './ObjectContent';
import { TextContent } from './TextContent';

/**
 *
 */
describe('check object content', () => {
    /**
     *
     */
    it('set empty', () => {
        const val = new ObjectContent();
        expect(val.getText()).toBe('{}');
        expect(val.toString()).toBe('{}');
    });

    /**
     *
     */
    it.each([
        ['{"b" : "c", "d" : { "e" : "f" } }', '{"b":"c","d":{"e":"f"}}'],
        ['{"a": "b", "c": 1}', '{"a":"b","c":1}'],
        ['{"0": "a"}', '["a"]'],
        ['{"0": "a", "1": "b"}', '["a","b"]'],
        [['a'], '["a"]'],
        ['a', '"a"'],
        [1.1, '1.1'],
        [1, '1'],
        [true, 'true'],
        [false, 'false'],
        [[true], '[true]'],
        [[false], '[false]'],
        [[1], '[1]'],
        [[0], '[0]'],
        [null, '{}'],
        [undefined, '{}'],
        [new TextContent('z'), '"z"'],
        [new NativeContent(new NativeContent(new TextContent('x'))), '"x"'],
        [new ObjectContent(new NullContent()), '""'],
        [new ObjectContent(new TextContent('a')), '"a"'],
        [new ObjectContent(new ObjectContent(new TextContent('a.b'))), '"a.b"'],
        [new ObjectContent(new ObjectContent({ 'a.c': new TextContent('d') })), '{"a.c":"d"}'],
        [new ObjectContent({ '0': null }), '[null]'],
        [new ObjectContent({ '0': new TextContent('a') }), '["a"]'],
        [new ObjectContent({ null: '' }), '{"null":""}'],
        [new ObjectContent({ '0': 'a' }), '["a"]'],
        [new ObjectContent({ a: 'b', 0: 'c' }), '{"0":"c","a":"b"}'],
        [new ObjectContent({ '0': 'a', 1: 'b', '2': 'c' }), '["a","b","c"]'],
        [new ObjectContent({ '0': 'a', 1: { a: 1, b: 2 } }), '["a",{"a":1,"b":2}]'],
        [new ObjectContent({ '0': 'a', 1: { 0: 1, 1: 2 } }), '["a",[1,2]]'],
        [new ObjectContent({ '0': 'a', 5: 'b' }), '["a",null,null,null,null,"b"]'],
        [new ObjectContent({ '0': 'a', 1: 'b', c: 'd' }), '{"0":"a","1":"b","c":"d"}'],
        [new ObjectContent({ z: 'a', 1: 'b', '2': 'c' }), '{"1":"b","2":"c","z":"a"}'],
        [new ObjectContent({ b: 'c', d: { e: 'f' } }), '{"b":"c","d":{"e":"f"}}'],
        [new ObjectContent({ b: 'c', d: new ObjectContent({ e: 'f' }) }), '{"b":"c","d":{"e":"f"}}'],
        [new ObjectContent({ b: 'c', d: new ObjectContent({ b: { c: ['d', 'e', 5] } }) }), '{"b":"c","d":{"b":{"c":["d","e",5]}}}']
    ])(`in: %s -> out: %s `, (contentInput: ContentType, jsonOotput: string) => {
        const sut = new ObjectContent(contentInput);
        expect(sut.getText()).toBe(jsonOotput);
        expect(sut.toJSON()).toBe(jsonOotput);
    });

    /**
     *
     */
    it('set property on empty object', () => {
        const val = new ObjectContent();
        val.set('a', 'a');
        expect(val.getText()).toBe('{"a":"a"}');
    });

    /**
     *
     */
    it('get simple property (number) from object value', () => {
        const val = new ObjectContent('{"a": 1}');
        const propValue = val.get('a');
        expect(propValue).toBeInteger();
        expect(propValue).toBe(1);
    });

    /**
     *
     */
    it('get property (string) from object value', () => {
        const val = new ObjectContent('{"a": "b", "c": 1}');
        const propValue = val.get('a');
        expect(propValue).toBeString();
        expect(propValue).toBe('b');
    });

    /**
     *
     */
    it('get property (number) from object value', () => {
        const val = new ObjectContent('{"a": "b", "c": 1}');
        const propValue = val.get('c');
        expect(propValue).toBeInteger();
        expect(propValue).toBe(1);
    });

    /**
     *
     */
    it('get property (object) from object value', () => {
        const val = new ObjectContent('{"a": "b", "c": 1, "d": {"e": "f"}}');
        const propValue = val.get('d');
        expect(propValue).toBeObject();
        expect(propValue).toEqual({
            e: 'f'
        });
    });

    /**
     *
     */
    it('get keys', () => {
        const sut = new ObjectContent('{"a": "1", "b": 2, "c": {"e": "f"}}');
        expect(sut.isObject()).toBeTrue();
        expect(sut.has('b')).toBeTrue();
        expect(sut.keys()).toEqual(['a', 'b', 'c']);
    });

    /**
     *
     */
    it('clear the object', () => {
        const sut = new ObjectContent('{"a": "1", "b": 2, "c": {"e": "f"}}');
        sut.clear();
        expect(sut.keys()).toEqual([]);
        expect(sut.has('b')).toBeFalse();
    });

    /**
     *
     */
    it('check isNullOrUndefined', () => {
        const sut = new ObjectContent('{"a": "1"');
        expect(sut.isNullOrUndefined()).toBeFalse();
        sut.clear();
        expect(sut.keys()).toEqual([]);
        expect(sut.isNullOrUndefined()).toBeTrue();
    });
    /**
     *
     */
    it('check isNullOrUndefined', () => {
        const sut = new ObjectContent('{"a": "1"');
        expect(sut.isNullOrUndefined()).toBeFalse();
        sut.clear();
        expect(sut.keys()).toEqual([]);
        expect(sut.isNullOrUndefined()).toBeTrue();
    });

    /**
     *
     */
    it('check isNullOrUndefined (empty init', () => {
        const sut = new ObjectContent();
        expect(sut.asDataContentObject()).toBe(sut);
        expect(sut.isNullOrUndefined()).toBeTrue();
    });
});
