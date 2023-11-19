import { Subject } from 'rxjs';

import { TextContent } from '../data/TextContent';
import { VariableParser } from '../parser/VariableParser';

import { StepStore } from './StepStore';

const onStartSubject = new Subject<void>();

/**
 *
 */
jest.mock('../runtime/Runtime', () => {
    return {
        Runtime: class {
            static instance = {
                stepRuntime: {
                    onStart: () => onStartSubject
                }
            };
        }
    };
});

/**
 *
 */
const pegParser = new VariableParser();

/**
 *
 */
describe('check step store', () => {
    /**
     *
     */
    it('put and get string value', () => {
        const sut = new StepStore();
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, 'b');

        expect(sut.get(ast)).toBe('b');
    });

    /**
     *
     */
    it('put and get DataContent value', () => {
        const sut = new StepStore();
        const ast = pegParser.parseAction('store:a');

        sut.put(ast, new TextContent('b'));

        expect(sut.get(ast)).toBeInstanceOf(TextContent);
        expect(sut.get(ast).toString()).toBe('b');
    });

    /**
     *
     */
    it('put and get and change context', () => {
        const sut = new StepStore();
        const ast = pegParser.parseAction('store:a');
        const ast_b = pegParser.parseAction('store:b');

        sut.put(ast, new TextContent('b'));
        onStartSubject.next();
        sut.put(ast_b, 'c');

        expect(sut.get(ast)).toBeUndefined();
        expect(sut.get(ast_b)).toBe('c');
    });

    /**
     *
     */
    it('clear step store', () => {
        const sut = new StepStore();
        const ast = pegParser.parseAction('store:a');
        const ast_b = pegParser.parseAction('store:b');

        sut.put(ast, new TextContent('b'));
        sut.put(ast_b, 'c');

        expect(sut.get(ast)).toBeDefined();
        expect(sut.get(ast_b)).toBe('c');
        sut.clear();
        expect(sut.get(ast)).toBeUndefined();
        expect(sut.get(ast_b)).toBeUndefined();
    });
});
