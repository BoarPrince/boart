import { JsonLogic } from '../../common/jsonlogic/JsonLogic';
require('./ArraySizeOperator');

/**
 *
 */
describe('check ArraySizeOperator', () => {
    /**
     *
     */
    it('simple array (number', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.size': { var: '' } }), '[1, 2, 3, 4]');
        expect(result).toBe(4);
    });

    /**
     *
     */
    it('simple array (string)', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.size': { var: '' } }), '["1", "2", "3", "4"]');
        expect(result).toBe(4);
    });

    /**
     *
     */
    it('array (object)', () => {
        const result = JsonLogic.instance.transform(
            JSON.stringify({ 'array.size': { var: '' } }),
            '[{"a": 1}, {"b": 2}, {"c": 3}, {"d": 4}]'
        );
        expect(result).toBe(4);
    });

    /**
     *
     */
    it('object list ', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.size': { var: '' } }), '{"a": 1, "b": 2, "c": 3, "d": 4}');
        expect(result).toBe(4);
    });

    /**
     *
     */
    it('empty object list ', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.size': { var: '' } }), '{}');
        expect(result).toBe(0);
    });

    /**
     *
     */
    it('empty array', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.size': { var: '' } }), '[]');
        expect(result).toBe(0);
    });

    /**
     *
     */
    it('null values', () => {
        const result = JsonLogic.instance.transform(JSON.stringify({ 'array.size': { var: '' } }), 'null');
        expect(result).toBe(0);
    });
});
