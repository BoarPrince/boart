import { ScopeType } from '../types/ScopeType';
import { OperatorType } from '../value/OperatorType';

import { VariableParser } from './VariableParser';
import { SelectorType } from './ast/SelectorType';

/**
 *
 */
const sut = new VariableParser();

/**
 *
 */
it('simple name', () => {
    const result = sut.parseVariable('${var}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.qualifier).toBeNull();
    expect(result.scope).toBeNull();
    expect(result.selectors).toBeArrayOfSize(0);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var');
});

/**
 *
 */
it('with selector', () => {
    const result = sut.parseVariable('${var#a}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.qualifier).toBeNull();
    expect(result.scope).toBeNull();

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var');

    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeArrayOfSize(1);
    expect(result.selectors[0].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[0].value).toBe('a');
});

/**
 *
 */
it('with qualifier and selector', () => {
    const result = sut.parseVariable('${var:name#a}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.scope).toBeNull();

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var');

    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeArrayOfSize(1);
    expect(result.selectors[0].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[0].value).toBe('a');

    expect(result.qualifier).toBeDefined();
    expect(result.qualifier.paras).toBeArrayOfSize(0);
    expect(result.qualifier.value).toBe('name');
});

/**
 *
 */
it('with two selectors', () => {
    const result = sut.parseVariable('${var#a.b}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.qualifier).toBeNull();
    expect(result.scope).toBeNull();

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var');

    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeArrayOfSize(2);

    expect(result.selectors[0].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[0].value).toBe('a');
    expect(result.selectors[0].optional).toBeFalsy();

    expect(result.selectors[1].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[1].value).toBe('b');
    expect(result.selectors[0].optional).toBeFalsy();
});

/**
 *
 */
it('optional selectors', () => {
    const result = sut.parseVariable('${var?#a.b.c}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.qualifier).toBeNull();
    expect(result.scope).toBeNull();

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var');

    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeArrayOfSize(3);

    expect(result.selectors[0].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[0].value).toBe('a');
    expect(result.selectors[0].optional).toBeTruthy();

    expect(result.selectors[1].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[1].value).toBe('b');
    expect(result.selectors[0].optional).toBeTruthy();

    expect(result.selectors[2].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[2].value).toBe('c');
    expect(result.selectors[0].optional).toBeTruthy();
});

/**
 *
 */
it('simple qualifier', () => {
    const result = sut.parseVariable('${generate:fake}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.scope).toBeNull();
    expect(result.selectors).toBeArrayOfSize(0);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('generate');

    expect(result.qualifier).toBeDefined();
    expect(result.qualifier.paras).toBeArrayOfSize(0);
    expect(result.qualifier.value).toBe('fake');
});

/**
 *
 */
it('extended qualifier', () => {
    const result = sut.parseVariable('${generate:fake:name:lastName}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.scope).toBeNull();
    expect(result.selectors).toBeArrayOfSize(0);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('generate');

    expect(result.qualifier).toBeDefined();
    expect(result.qualifier.value).toBe('fake');
    expect(result.qualifier.paras).toBeArrayOfSize(2);

    expect(result.qualifier.paras[0]).toBe('name');
    expect(result.qualifier.paras[1]).toBe('lastName');
});

/**
 *
 */
it('scope with extended qualifier', () => {
    const result = sut.parseVariable('${generate@g:name:lastName}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.selectors).toBeArrayOfSize(0);

    expect(result.scope).toBeDefined();
    expect(result.scope.value).toBe(ScopeType.Global);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('generate');

    expect(result.qualifier).toBeDefined();
    expect(result.qualifier.value).toBe('name');

    expect(result.qualifier.paras).toBeArrayOfSize(1);
    expect(result.qualifier.paras[0]).toBe('lastName');
});

/**
 *
 */
it('with scope and selector', () => {
    const result = sut.parseVariable('${var@t#a.b.c}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.qualifier).toBeNull();

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var');

    expect(result.scope).toBeDefined();
    expect(result.scope.value).toBe(ScopeType.Test);

    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeArrayOfSize(3);

    const firstSelector = result.selectors[0];
    expect(firstSelector.type).toBe(SelectorType.SIMPLE);
    expect(firstSelector.optional).toBe(false);
    expect(firstSelector.value).toBe('a');

    const secondSelector = result.selectors[1];
    expect(secondSelector.type).toBe(SelectorType.SIMPLE);
    expect(secondSelector.optional).toBe(false);
    expect(secondSelector.value).toBe('b');

    const thirdSelector = result.selectors[2];
    expect(thirdSelector.type).toBe(SelectorType.SIMPLE);
    expect(thirdSelector.optional).toBe(false);
    expect(thirdSelector.value).toBe('c');
});

/**
 *
 */
it('nested', () => {
    const result = sut.parseVariable('${var+name${var2@l}}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.qualifier).toBeNull();
    expect(result.selectors).toBeArrayOfSize(0);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var2');

    expect(result.scope).toBeDefined();
    expect(result.scope.value).toBe(ScopeType.Local);
});

/**
 *
 */
it('with string para', () => {
    const result = sut.parseVariable('${generate:fake:"pa\'ra"}');

    expect(result.pipes).toBeArrayOfSize(0);
    expect(result.scope).toBeNull();
    expect(result.selectors).toBeArrayOfSize(0);

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('generate');

    expect(result.qualifier).toBeDefined();
    expect(result.qualifier.value).toBe('fake');

    expect(result.qualifier.paras).toBeArrayOfSize(1);
    expect(result.qualifier.paras[0]).toBe("pa'ra");
});

/**
 *
 */
it('complex', () => {
    const result = sut.parseVariable('${var3@s:aaaa:"bb1\\n":bb2#aa[3].bb.cc.dd[1].ee[*].ff[3:]?.gg[0:-4].hh[1,2,32] | pipe:4:"\'3\'"}');

    expect(result.qualifier.value).toBe('aaaa');
    expect(result.qualifier.paras[0]).toBe('bb1\n');
    expect(result.qualifier.paras[1]).toBe('bb2');

    expect(result.name).toBeDefined();
    expect(result.name.value).toBe('var3');

    expect(result.pipes).toBeArrayOfSize(1);
    expect(result.pipes[0].name).toBe('pipe');
    expect(result.pipes[0].paras).toBeArrayOfSize(2);

    expect(result.scope).toBeDefined();
    expect(result.scope.value).toBe(ScopeType.Step);

    expect(result.selectors).toBeDefined();
    expect(result.selectors).toBeArrayOfSize(8);

    expect(result.selectors[0].type).toBe(SelectorType.INDEX);
    expect(result.selectors[0].index).toBe(3);
    expect(result.selectors[0].value).toBe('aa');

    expect(result.selectors[1].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[1].index).toBeUndefined();
    expect(result.selectors[1].value).toBe('bb');

    expect(result.selectors[2].type).toBe(SelectorType.SIMPLE);
    expect(result.selectors[2].index).toBeUndefined();
    expect(result.selectors[2].value).toBe('cc');

    expect(result.selectors[3].type).toBe(SelectorType.INDEX);
    expect(result.selectors[3].index).toBe(1);
    expect(result.selectors[3].value).toBe('dd');

    expect(result.selectors[4].type).toBe(SelectorType.WILDCARD);
    expect(result.selectors[4].optional).toBeFalsy();
    expect(result.selectors[4].value).toBe('ee');

    expect(result.selectors[5].type).toBe(SelectorType.START);
    expect(result.selectors[5].optional).toBeFalsy();
    expect(result.selectors[5].start).toBe(3);

    expect(result.selectors[6].type).toBe(SelectorType.STARTEND);
    expect(result.selectors[6].optional).toBeTruthy();
    expect(result.selectors[6].start).toBe(0);
    expect(result.selectors[6].end).toBe(-4);

    expect(result.selectors[7].type).toBe(SelectorType.LIST);
    expect(result.selectors[7].optional).toBeFalsy();
    expect(result.selectors[7].indexes).toBeDefined();
    expect(result.selectors[7].indexes).toBeArrayOfSize(3);
    expect(result.selectors[7].indexes[0]).toBe(1);
    expect(result.selectors[7].indexes[1]).toBe(2);
    expect(result.selectors[7].indexes[2]).toBe(32);
});

/**
 *
 */
it('check match', () => {
    const match = '${var3@s:aaaa:"bb1\\n":bb2#aa[3].bb.cc.dd[1].ee[*].ff[3:]?.gg[0:-4].hh[1,2,32] | pipe:4:"\'3\'"}';
    const result = sut.parseVariable(match);
    expect(result.match).toBe(match);
});

/**
 *
 */
it('default - assignment', () => {
    const result = sut.parseVariable('${var:aa := aabbbcc}');

    expect(result.default).toBeDefined();
    expect(result.default.value).toBe('aabbbcc');
    expect(result.default.operator).toBe(OperatorType.DefaultAssignment);
});

/**
 *
 */
it('default - value', () => {
    const result = sut.parseVariable('${var:aa :- aabbbcc}');

    expect(result.default).toBeDefined();
    expect(result.default.value).toBe('aabbbcc');
    expect(result.default.operator).toBe(OperatorType.Default);
});

/**
 *
 */
it('default - complex 1', () => {
    const result = sut.parseVariable('${var:aa :- ":-"}');

    expect(result.default).toBeDefined();
    expect(result.default.value).toBe(':-');
    expect(result.default.operator).toBe(OperatorType.Default);
});

/**
 *
 */
it('default - complex 2', () => {
    const result = sut.parseVariable('${var:aa :- "\\${aaa}"}');

    expect(result.default).toBeDefined();
    expect(result.default.value).toBe('${aaa}');
    expect(result.default.operator).toBe(OperatorType.Default);
});

/**
 *
 */
it('default - complex 3', () => {
    const result = sut.parseVariable('${var:aa :- "{aaa}"}');

    expect(result.default).toBeDefined();
    expect(result.default.value).toBe('{aaa}');
    expect(result.default.operator).toBe(OperatorType.Default);
});

/**
 *
 */
it('no match', () => {
    const result = sut.parseVariable('#{var:aa}');
    expect(result).toBeNull();
});

/**
 *
 */
it('error can occur', () => {
    expect(() => sut.parseVariable('${var,var}')) //
        .toThrow(
            'Expected "#", ":", ":-", ":=", "?#", "@", "|", [ \\t], [a-zA-Z0-9\\-_], or end of input but "," found.\n${var -> , <- var}'
        );
});

/**
 *
 */
it('error can occur in strings', () => {
    expect(() => sut.parseVariable('${var:aa:"\\n\\n""}')) //
        .toThrow('Expected "#", ":", ":-", ":=", "?#", "|", [ \\t], or end of input but "\\"" found.\n${var:aa:"\\n\\n" -> " <- }');
});

/**
 *
 */
it('qualifier - action - stringValue - 1', () => {
    const result = sut.parseAction('var:aa:bb:cc');
    expect(result.qualifier.stringValue).toBe('aa:bb:cc');
});

/**
 *
 */
it('qualifier - action - stringValue - 2', () => {
    const result = sut.parseAction('var:aa');
    expect(result.qualifier.stringValue).toBe('aa');
});

/**
 *
 */
it('qualifier - variable - stringValue', () => {
    const result = sut.parseVariable('${var:aa:bb:cc}');
    expect(result.qualifier.stringValue).toBe('aa:bb:cc');
});

/**
 *
 */
it('selector - action - stringValue - 1', () => {
    const result = sut.parseAction('var#aa.bb.cc');
    expect(result.selectors.stringValue).toBe('aa.bb.cc');
});

/**
 *
 */
it('selector - action - stringValue - 2', () => {
    const result = sut.parseAction('var#aa[6].bb.cc');
    expect(result.selectors.stringValue).toBe('aa[6].bb.cc');
});

/**
 *
 */
it('selector - action - stringValue - 3', () => {
    const result = sut.parseAction('var#aa.bb[*].cc');
    expect(result.selectors.stringValue).toBe('aa.bb[*].cc');
});

/**
 *
 */
it('dataselector - action - 1', () => {
    const result = sut.parseAction('var::data#aa.bb[*].cc');
    expect(result.datascope).toBeDefined();
    expect(result.datascope.value).toBe('data');
});

/**
 *
 */
it('string value name', () => {
    const result = sut.parseAction('var:qual:para1:para2');
    expect(result.name.stringValue).toBe('var:qual:para1:para2');
});
