import { JsonLogic } from '../JsonLogic';
require('./ArraySelectRandomOperator');

/**
 *
 */
describe('check ArraySelectRandomOperator', () => {
    /**
     *
     */
    it('simple array (number', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.random': { var: '' } }), '[1, 2, 3, 4]');
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(4);
    });

    /**
     *
     */
    it('simple array (string)', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.random': { var: '' } }), '["1", "2", "3", "4"]');
        expect(result).toBeString();
        expect(result).toBeOneOf(['1', '2', '3', '4']);
    });

    /**
     *
     */
    it('array (object)', () => {
        const result = JsonLogic.instance.transform(
            JSON.stringify({ 'array.random': { var: '' } }),
            '[{"a": 1}, {"b": 2}, {"c": 3}, {"d": 4}]'
        );
        expect(result).toBeOneOf([{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }]);
    });

    /**
     *
     */
    it('object list ', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.random': { var: '' } }), '{"a": 1, "b": 2, "c": 3, "d": 4}');
        expect(result).toBeOneOf([1, 2, 3, 4]);
    });

    /**
     *
     */
    it('empty object list ', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.random': { var: '' } }), '{}');
        expect(result).toBeUndefined();
    });

    /**
     *
     */
    it('empty array', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.random': { var: '' } }), '[]');
        expect(result).toBeUndefined();
    });

    /**
     *
     */
    it('null values', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.random': { var: '' } }), 'null');
        expect(result).toBeNull();
    });
});
