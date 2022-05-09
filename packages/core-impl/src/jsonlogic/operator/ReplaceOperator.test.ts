import { JsonLogic } from '../JsonLogic';
require('./ReplaceOperator');

/**
 *
 */
describe('check ReplaceOperator', () => {
    /**
     *
     */
    it('simple replace', () => {
        const result = JsonLogic.instance.transform(
            JSON.stringify({ 'string.replace': [{ var: '' }, '-to-replace-', '-is-replaced-'] }),
            JSON.stringify({ a: '-to-replace-' })
        );
        expect(result).toStrictEqual({ a: '-is-replaced-' });
    });
});
