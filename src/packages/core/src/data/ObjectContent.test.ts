import 'jest-extended';

import { ContentType } from './ContentType';
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
        ['01.', '{"b" : "c", "d" : { "e" : "f" } }', '{"b":"c","d":{"e":"f"}}', true],
        ['02.', '{"a": "b", "c": 1}', '{"a":"b","c":1}', true],
        ['03.', '{"0": "a"}', '["a"]', true],
        ['04.', '{"0": "a", "1": "b"}', '["a","b"]', true],
        ['05.', ['a'], '["a"]', true],
        ['06.', 'a', 'a', false],
        ['07.', 1.1, '1.1', true],
        ['08.', 1, '1', true],
        ['09.', true, 'true', true],
        ['10.', false, 'false', true],
        ['11.', [true], '[true]', true],
        ['12.', [false], '[false]', true],
        ['13.', [1], '[1]', true],
        ['14.', [0], '[0]', true],
        ['15.', null, '{}', true],
        ['16.', undefined, '{}', true],
        ['17.', new TextContent('z'), 'z', false],
        ['18.', new ObjectContent(), '{}', true],
        ['19.', new ObjectContent(new NullContent()), '{}', true],
        ['20.', new ObjectContent(new TextContent('a')), 'a', false],
        ['21.', new ObjectContent(new ObjectContent(new TextContent('a.b'))), 'a.b', false],
        ['22.', new ObjectContent(new ObjectContent({ 'a.c': new TextContent('d') })), '{"a.c":"d"}', true],
        ['23.', new ObjectContent({ '0': null }), '[null]', true],
        ['24.', new ObjectContent({ '0': new TextContent('a') }), '["a"]', true],
        ['25.', new ObjectContent({ null: '' }), '{"null":""}', true],
        ['26.', new ObjectContent({ '0': 'a' }), '["a"]', true],
        ['27.', new ObjectContent({ a: 'b', 0: 'c' }), '{"0":"c","a":"b"}', true],
        ['28.', new ObjectContent({ '0': 'a', 1: 'b', '2': 'c' }), '["a","b","c"]', true],
        ['29.', new ObjectContent({ '0': 'a', 1: { a: 1, b: 2 } }), '["a",{"a":1,"b":2}]', true],
        ['30.', new ObjectContent({ '0': 'a', 1: { 0: 1, 1: 2 } }), '["a",[1,2]]', true],
        ['31.', new ObjectContent({ '0': 'a', 5: 'b' }), '["a",null,null,null,null,"b"]', true],
        ['32.', new ObjectContent({ '0': 'a', 1: 'b', c: 'd' }), '{"0":"a","1":"b","c":"d"}', true],
        ['33.', new ObjectContent({ z: 'a', 1: 'b', '2': 'c' }), '{"1":"b","2":"c","z":"a"}', true],
        ['34.', new ObjectContent({ b: 'c', d: { e: 'f' } }), '{"b":"c","d":{"e":"f"}}', true],
        ['35.', new ObjectContent({ b: 'c', d: new ObjectContent({ e: 'f' }) }), '{"b":"c","d":{"e":"f"}}', true],
        [
            '36.',
            new ObjectContent({ b: 'c', d: new ObjectContent({ b: { c: ['d', 'e', 5] } }) }),
            '{"b":"c","d":{"b":{"c":["d","e",5]}}}',
            true
        ]
    ])(`%s: in: %s -> out: %s `, (comment: string, contentInput: ContentType | undefined, jsonOutput: string, jsonAndTextSame: boolean) => {
        const sut = new ObjectContent(contentInput);
        expect(sut.getText()).toBe(jsonOutput);
        expect(sut.toJSON()).toBe(jsonAndTextSame ? jsonOutput : JSON.stringify(jsonOutput));
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
    it('length - object', () => {
        const val = new ObjectContent({ a: 'b', c: 1, d: { e: 'f' } });
        expect(val).toHaveLength(3);
    });

    /**
     *
     */
    it('length - array', () => {
        const val = new ObjectContent([1, 1, 1, 1]);
        expect(val).toHaveLength(4);
    });

    /**
     *
     */
    it('length - native - 1', () => {
        const val = new ObjectContent(4);
        expect(val).toHaveLength(0);
    });

    /**
     *
     */
    it('length - native - 2', () => {
        const val = new ObjectContent('111111');
        expect(val).toHaveLength(0);
    });

    /**
     *
     */
    it('length - native - 3', () => {
        const val = new ObjectContent(undefined);
        expect(val).toHaveLength(0);
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
    it('check isNullOrUndefined after clearing', () => {
        const sut = new ObjectContent('{"a": "1"');
        expect(sut.isNullOrUndefined()).toBeFalse();

        sut.clear();
        expect(sut.keys()).toEqual([]);
        expect(sut.isNullOrUndefined()).toBeFalsy();
    });

    /**
     *
     */
    it('check isNullOrUndefined', () => {
        const sut = new ObjectContent(null);
        expect(sut.isNullOrUndefined()).toBeFalsy();
    });

    /**
     *
     */
    it('check isNullOrUndefined (empty init', () => {
        const sut = new ObjectContent();
        expect(sut.asDataContentObject()).toBe(sut);
        expect(sut.isNullOrUndefined()).toBeFalsy();
    });
});
