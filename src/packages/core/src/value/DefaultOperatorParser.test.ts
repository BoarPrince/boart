import { DefaultOperatorParser } from './DefaultOperatorParser';
import { OperatorType } from './OperatorType';

/**
 *
 */
it('default', () => {
    const sut = DefaultOperatorParser.parse('prop');

    expect(sut.property).toBe('prop');
    expect(sut.operator.type).toBe(OperatorType.None);
    expect(sut.defaultValue).toBeUndefined();
});

/**
 *
 */
it('with default value', () => {
    const sut = DefaultOperatorParser.parse('prop:-def');

    expect(sut.property).toBe('prop');
    expect(sut.operator.type).toBe(OperatorType.Default);
    expect(sut.operator.value).toBe(':-');
    expect(sut.defaultValue).toBe('def');
});

/**
 *
 */
it('with default assignment', () => {
    const sut = DefaultOperatorParser.parse('prop:=def');

    expect(sut.property).toBe('prop');
    expect(sut.operator.type).toBe(OperatorType.DefaultAssignment);
    expect(sut.operator.value).toBe(':=');
    expect(sut.defaultValue).toBe('def');
});

/**
 *
 */
it('with default assignment, but no default value', () => {
    expect(() => DefaultOperatorParser.parse('prop:=')).toThrowError("expression 'prop:=' requires a default value");
});

/**
 *
 */
it('with default unknown operator', () => {
    const sut = DefaultOperatorParser.parse('prop:<def');

    expect(sut.property).toBe('prop');
    expect(sut.operator.type).toBe(OperatorType.Unknown);
    expect(sut.operator.value).toBe(':<');
    expect(sut.defaultValue).toBe('def');
});

/**
 *
 */
it('with custom operator', () => {
    const sut = DefaultOperatorParser.parse('prop:operator');

    expect(sut.property).toBe('prop');
    expect(sut.operator.type).toBe(OperatorType.Unknown);
    expect(sut.operator.value).toBe('operator');
    expect(sut.defaultValue).toBeUndefined();
});
