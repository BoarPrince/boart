import { NativeContent } from './NativeContent';
import { TextContent } from './TextContent';

/**
 *
 */
describe('check data content base', () => {
    /**
     *
     */
    it('check toJSON (TextContent, normal string)', () => {
        const sut = new TextContent('a');
        expect(sut.toJSON()).toBe('"a"');
    });

    /**
     *
     */
    it('check toJSON (TextContent, json string)', () => {
        const sut = new TextContent('{"a":"b"}');
        expect(sut.toJSON()).toBe('{"a":"b"}');
    });

    /**
     *
     */
    it('check toString (TextContent, json string)', () => {
        const sut = new TextContent('{"a":"b"}');
        expect(sut.toString()).toBe('{"a":"b"}');
    });

    /**
     *
     */
    it('check isObject', () => {
        const sut = new NativeContent(1);
        expect(sut.isObject()).toBe(false);
    });

    /**
     *
     */
    it('check isDataContentObject', () => {
        const sut = new NativeContent(1);
        expect(sut.asDataContentObject()).toBeNull();
    });

    /**
     *
     */
    it('check isNullOrUndefined', () => {
        const sut = new NativeContent(1);
        expect(sut.isNullOrUndefined()).toBeFalsy();
    });

    /**
     *
     */
    it('check getValue (NativeContent)', () => {
        const sut = new NativeContent(false);
        expect(sut.getValue()).toBeFalsy();
    });

    /**
     *
     */
    it('check getText (NativeContent)', () => {
        const sut = new NativeContent(false);
        expect(sut.getText()).toBe('false');
    });

    /**
     *
     */
    it('check getText (NativeContent, null)', () => {
        const sut = new NativeContent(null);
        expect(sut.getText()).toBeUndefined();
    });
});
