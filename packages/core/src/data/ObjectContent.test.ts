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
        ['01.', '{"b" : "c", "d" : { "e" : "f" } }', '{"b":"c","d":{"e":"f"}}'],
        ['02.', '{"a": "b", "c": 1}', '{"a":"b","c":1}'],
        ['03.', '{"0": "a"}', '["a"]'],
        ['04.', '{"0": "a", "1": "b"}', '["a","b"]'],
        ['05.', ['a'], '["a"]'],
        ['06.', 'a', '"a"'],
        ['07.', 1.1, '1.1'],
        ['08.', 1, '1'],
        ['09.', true, 'true'],
        ['10.', false, 'false'],
        ['11.', [true], '[true]'],
        ['12.', [false], '[false]'],
        ['13.', [1], '[1]'],
        ['14.', [0], '[0]'],
        ['15.', null, '{}'],
        ['16.', undefined, '{}'],
        ['17.', new TextContent('z'), '"z"'],
        ['18.', new NativeContent(new NativeContent(new TextContent('x'))), '"x"'],
        ['19.', new ObjectContent(new NullContent()), '{}'],
        ['20.', new ObjectContent(new TextContent('a')), '"a"'],
        ['21.', new ObjectContent(new ObjectContent(new TextContent('a.b'))), '"a.b"'],
        ['22.', new ObjectContent(new ObjectContent({ 'a.c': new TextContent('d') })), '{"a.c":"d"}'],
        ['23.', new ObjectContent({ '0': null }), '[null]'],
        ['24.', new ObjectContent({ '0': new TextContent('a') }), '["a"]'],
        ['25.', new ObjectContent({ null: '' }), '{"null":""}'],
        ['26.', new ObjectContent({ '0': 'a' }), '["a"]'],
        ['27.', new ObjectContent({ a: 'b', 0: 'c' }), '{"0":"c","a":"b"}'],
        ['28.', new ObjectContent({ '0': 'a', 1: 'b', '2': 'c' }), '["a","b","c"]'],
        ['29.', new ObjectContent({ '0': 'a', 1: { a: 1, b: 2 } }), '["a",{"a":1,"b":2}]'],
        ['30.', new ObjectContent({ '0': 'a', 1: { 0: 1, 1: 2 } }), '["a",[1,2]]'],
        ['31.', new ObjectContent({ '0': 'a', 5: 'b' }), '["a",null,null,null,null,"b"]'],
        ['32.', new ObjectContent({ '0': 'a', 1: 'b', c: 'd' }), '{"0":"a","1":"b","c":"d"}'],
        ['33.', new ObjectContent({ z: 'a', 1: 'b', '2': 'c' }), '{"1":"b","2":"c","z":"a"}'],
        ['34.', new ObjectContent({ b: 'c', d: { e: 'f' } }), '{"b":"c","d":{"e":"f"}}'],
        ['35.', new ObjectContent({ b: 'c', d: new ObjectContent({ e: 'f' }) }), '{"b":"c","d":{"e":"f"}}'],
        ['36.', new ObjectContent({ b: 'c', d: new ObjectContent({ b: { c: ['d', 'e', 5] } }) }), '{"b":"c","d":{"b":{"c":["d","e",5]}}}']
    ])(`%s: in: %s -> out: %s `, (comment: string, contentInput: ContentType | undefined, jsonOotput: string) => {
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
