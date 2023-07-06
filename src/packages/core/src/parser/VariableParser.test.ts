import { VariableParser } from './VariableParser';

/**
 *
 */
const sut = new VariableParser();

/**
 *
 */
it('simple name', () => {
    const result = sut.parse('${var}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toEqual('var');
    expect(result.ast.qualifiers).toBeEmpty();
    expect(result.ast.selectors).toBeUndefined();
});

/**
 *
 */
it('with selector', () => {
    const result = sut.parse('${var#a}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toEqual('var');
    expect(result.ast.qualifiers).toBeEmpty();
    expect(result.ast.selectors).toBeArrayOfSize(1);
    expect(result.ast.selectors[0].def.value).toBe('a');
});

/**
 *
 */
it('with qualifier and selector', () => {
    const result = sut.parse('${var:name#a}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toEqual('var');
    expect(result.ast.qualifiers).toBeArrayOfSize(1);
    expect(result.ast.qualifiers[0].value).toBe('name');
    expect(result.ast.selectors).toBeArrayOfSize(1);
    expect(result.ast.selectors[0].def.value).toBe('a');
});

it('with two selectors', () => {
    const result = sut.parse('${var#a.b}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toEqual('var');
    expect(result.ast.qualifiers).toBeEmpty();

    expect(result.ast.selectors).toBeArrayOfSize(2);
    expect(result.ast.selectors[0].def.value).toBe('a');
    expect(result.ast.selectors[1].def.value).toBe('b');
});

/**
 *
 */
it('simple qualifier', () => {
    const result = sut.parse('${generate:fake}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.qualifiers).toBeArrayOfSize(1);
    expect(result.ast.qualifiers[0].value).toEqual('fake');
    expect(result.ast.selectors).toBeUndefined();
});

/**
 *
 */
it('extended qualifier', () => {
    const result = sut.parse('${generate:fake:name:lastName}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.qualifiers).toBeArrayOfSize(3);
    expect(result.ast.qualifiers[0].value).toEqual('fake');
    expect(result.ast.qualifiers[1].value).toEqual('name');
    expect(result.ast.qualifiers[2].value).toEqual('lastName');
    expect(result.ast.selectors).toBeUndefined();
});

/**
 *
 */
it('scope with extended qualifier', () => {
    const result = sut.parse('${generate+fake:name:lastName}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.qualifiers).toBeArrayOfSize(2);
    expect(result.ast.qualifiers[0].value).toEqual('name');
    expect(result.ast.qualifiers[1].value).toEqual('lastName');
    expect(result.ast.selectors).toBeUndefined();
});

/**
 *
 */
it('with scope', () => {
    const result = sut.parse('${var+name#a.b.c}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toBe('var');
    expect(result.ast.qualifiers).toBeArrayOfSize(0);
    expect(result.ast.scope.value).toEqual('name');

    expect(result.ast.selectors).toBeArrayOfSize(3);
    expect(result.ast.selectors[0].def.value).toBe('a');
    expect(result.ast.selectors[1].def.value).toBe('b');
    expect(result.ast.selectors[2].def.value).toBe('c');
});

/**
 *
 */
it('nested', () => {
    const result = sut.parse('${var+name${var2+name2}}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toBe('var2');
    expect(result.ast.qualifiers).toBeArrayOfSize(0);
    expect(result.ast.scope.value).toEqual('name2');
});

/**
 *
 */
it('failure', () => {
    const result = sut.parse('{var2+name2}');

    expect(result.errs[0].expmatches[0]).toBeEmpty();
    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toBe('var2');
    expect(result.ast.qualifiers).toBeArrayOfSize(0);
    expect(result.ast.scope.value).toEqual('name2');
});

/**
 *
 */
it('nested', () => {
    const result = sut.parse('${var+name${var2+name2}}');

    expect(result.errs).toBeEmpty();
    expect(result.ast.name).toBe('var2');
    expect(result.ast.qualifiers).toBeArrayOfSize(0);
    expect(result.ast.scope.value).toEqual('name2');
});
