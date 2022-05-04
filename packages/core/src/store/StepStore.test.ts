import { StepStore } from './StepStore';
import { TextContent } from '../data/TextContent';

describe('check step store', () => {
    /**
     *
     */
    it('put and get string value', () => {
        const sut = new StepStore();

        sut.put('a', 'b');

        expect(sut.get('a')).toBe('b');
    });

    /**
     *
     */
    it('put and get DataContent value', () => {
        const sut = new StepStore();

        sut.put('a', new TextContent('b'));

        expect(sut.get('a')).toBeInstanceOf(TextContent);
        expect(sut.get('a').toString()).toBe('b');
    });

    /**
     *
     */
    it('put and get and change context', () => {
        const sut = new StepStore();

        sut.put('a', new TextContent('b'));
        sut.changeContext({});
        sut.put('b', 'c');

        expect(sut.get('a')).toBeUndefined();
        expect(sut.get('b')).toBe('c');
    });

    /**
     *
     */
    it('clear step store', () => {
        const sut = new StepStore();

        sut.put('a', new TextContent('b'));
        sut.put('b', 'c');

        expect(sut.get('a')).toBeDefined();
        expect(sut.get('b')).toBe('c');
        sut.clear();
        expect(sut.get('a')).toBeUndefined();
        expect(sut.get('b')).toBeUndefined();
    });
});
