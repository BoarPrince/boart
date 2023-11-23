import { ASTVariable, ContentType, ExecutionContext, NullContent, ObjectContent, VariableParser } from '@boart/core';

import { DataExecutionContext } from '../../DataExecutionContext';
import { RowTypePropValue } from '../../RowTypePropValue';
import { RowTypeValue } from '../../RowTypeValue';

import { PropertySetterExecutionUnit } from './PropertySetterExecutionUnit';

/**
 *
 */
const variableParser = new VariableParser();

/**
 *
 */
const defaultActionSelectorSetter = (aggregationValue: ContentType, rowValue: ContentType, ast: ASTVariable): ContentType => {
    const selector: string = ast.selectors.match;
    const value = !aggregationValue ? '' : aggregationValue.toString() + '&';
    return `${value}${selector}=${rowValue.toString()}`;
};

/**
 *
 */
const defaultActionSelectorModifier = (rowValue: ContentType): ContentType => {
    return `-${rowValue?.toString() || ''}-`;
};

/**
 *
 */
enum ContextType {
    Neither = 'neither',
    Nor = 'nor'
}

/**
 *
 */
type RestCallContext = {
    method: string;
    url: string;
};

/**
 *
 */
type DataContext = ExecutionContext<
    {
        value: ContentType;
        type: ContextType;
        restCall?: RestCallContext;
    },
    null,
    DataExecutionContext
>;

/**
 *
 */
let context: DataContext;
beforeEach(() => {
    context = {
        config: {
            value: null,
            type: ContextType.Neither
        },
        preExecution: null,
        execution: {
            data: null,
            header: null,
            transformed: null
        }
    };
});
/**
 *
 */
it('check (2 levels)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');

    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('xxx');
});

/**
 *
 */
it('check (1 level)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config');

    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config.toString()).toBe('xxx');
});

/**
 *
 */
it('check with concating (but not using)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: true });

    context.config.value = '';
    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('xxx');
});

/**
 *
 */
it('check null initialized', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');

    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('xxx');
});

/**
 *
 */
it('check null initialized and selector', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');

    const ast = variableParser.parseAction('a:a#a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('{"a":"xxx"}');
});

/**
 *
 */
it('check NullContent initialized', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');
    context.config.value = new NullContent();

    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('xxx');
});

/**
 *
 */
it('check NullContent initialized and selector', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');
    context.config.value = new NullContent();

    const ast = variableParser.parseAction('a:a#a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('{"a":"xxx"}');
});

/**
 *
 */
it('check with concating', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: true });

    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'yyy'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value']?.toString()).toBe('xxx\nyyy');
});

/**
 *
 */
it('check with selector', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: false });
    context.config.value = JSON.stringify({
        a: 'b',
        c: 'd',
        e: 3
    });

    const ast = variableParser.parseAction('a:a#c');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: 'f'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('{"a":"b","c":"f","e":3}');
});

/**
 *
 */
it('check with selector - two changes', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: false });
    context.config.value = JSON.stringify({
        a: 'b',
        c: 'd',
        e: 3
    });

    const ast = variableParser.parseAction('a:a#c');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: 'f'
        },
        _metaDefinition: null
    });

    const ast2 = variableParser.parseAction('a:a#e');
    const row2 = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast: ast2,
        values_replaced: {
            value: '4'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value'].toString()).toBe('{"a":"b","c":"f","e":4}');
});

/**
 *
 */
it('check with selector - use object in context', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');
    context.config.value = new ObjectContent();

    const ast = variableParser.parseAction('param#c');
    const row = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: '1'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('{"c":1}');
});

/**
 *
 */
it('check with actionPara (deep)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: false });

    context.config.value = JSON.stringify({
        a: {
            f: 4
        },
        c: 'd',
        e: 3
    });

    const ast = variableParser.parseAction('a:a#a.f');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('{"a":{"f":5},"c":"d","e":3}');
});

/**
 *
 */
it('check with actionPara (null init)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: false });

    const ast = variableParser.parseAction('a:a#a.f');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('{"a":{"f":5}}');
});

/**
 *
 */
it('check with actionPara (use actionParaModifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorModifier: (rowValue) => `-${String(rowValue?.toString())}-`
    });

    const ast = variableParser.parseAction('a:a#a.f');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('{"a":{"f":"-5-"}}');
});

/**
 *
 */
it('check without actionPara (use defaultModifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        defaultModifier: (rowValue) => `-${String(rowValue?.toString())}-`
    });

    const ast = variableParser.parseAction('a:a');
    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: '',
        selector: undefined,
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('-5-');
});

/**
 *
 */
it('check query style (actionParaSetter), one para', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorSetter: (_value: ContentType, rowValue: ContentType, ast: ASTVariable): ContentType => {
            const selector: string = ast.selectors.match;
            return `${selector}=${String(rowValue?.toString())}`;
        }
    });

    const ast = variableParser.parseAction('query#id');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('id=5');
});

/**
 *
 */
it('check query style (actionParaSetter), three paras', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorSetter: defaultActionSelectorSetter
    });

    const ast = variableParser.parseAction('query#id');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    const ast2 = variableParser.parseAction('query#id2');
    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        ast: ast2,
        values_replaced: {
            value: '6'
        },
        _metaDefinition: null
    });

    const ast3 = variableParser.parseAction('query#id3');
    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        ast: ast3,
        values_replaced: {
            value: '7'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    sut.execute(context, row3);
    expect(context.config['value']?.toString()).toBe('id=5&id2=6&id3=7');
});

/**
 *
 */
it('check query style (actionParaSetter and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorSetter: defaultActionSelectorSetter,
        actionSelectorModifier: defaultActionSelectorModifier
    });

    const ast = variableParser.parseAction('query#id');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: 'id',
        ast,
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']?.toString()).toBe('id=-5-');
});

/**
 *
 */
it('check query style (default and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        defaultModifier: (rowValue: ContentType): ContentType => {
            return String(rowValue)
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const ast = variableParser.parseAction('query');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: '',
        ast,
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: '',
        ast,
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value']?.toString()).toBe('-a-=-1-&-b-=-2-');
});

/**
 *
 */
it('check query style (default, para and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        actionSelectorSetter: defaultActionSelectorSetter,
        actionSelectorModifier: defaultActionSelectorModifier,
        defaultModifier: (rowValue: ContentType): ContentType => {
            return (rowValue || '')
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const ast = variableParser.parseAction('query');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: '',
        ast,
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: '',
        ast,
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    const ast3 = variableParser.parseAction('query#c');
    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: 'c',
        ast: ast3,
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    sut.execute(context, row3);
    expect(context.config['value']?.toString()).toBe('-a-=-1-&-b-=-2-&c=-3-');
});

/**
 *
 */
it('check query style - default, para and modifier', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        actionSelectorSetter: defaultActionSelectorSetter,
        actionSelectorModifier: defaultActionSelectorModifier,
        defaultModifier: (rowValue: ContentType): ContentType => {
            return String(rowValue)
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const ast = variableParser.parseAction('query');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: '',
        ast,
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: '',
        ast,
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    const ast3 = variableParser.parseAction('query#c');
    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        ast: ast3,
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row3);
    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value']?.toString()).toBe('c=-3-&-a-=-1-&-b-=-2-');
});

/**
 *
 */
it('check query style (default, para, default and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        actionSelectorSetter: defaultActionSelectorSetter,
        actionSelectorModifier: defaultActionSelectorModifier,
        defaultModifier: (rowValue: ContentType): ContentType => {
            return String(rowValue)
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const ast = variableParser.parseAction('query');
    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: '',
        ast,
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        selector: '',
        ast,
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    const ast3 = variableParser.parseAction('query#c');
    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: undefined,
        ast: ast3,
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row3);
    sut.execute(context, row2);
    expect(context.config['value']?.toString()).toBe('-a-=-1-&c=-3-&-b-=-2-');
});

/**
 *
 */
it('check method/url style', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'restCall', {
        defaultSetter: (value: ContentType, rowValue: ContentType, para: string): RestCallContext => ({
            method: para,
            url: String(rowValue?.toString())
        })
    });

    context.config.restCall = {
        url: '',
        method: ''
    };

    const ast = variableParser.parseAction('method:post');
    const row = new RowTypePropValue<DataContext>({
        key: 'method',
        keyPara: 'post',
        selector: undefined,
        ast,
        values_replaced: {
            value: 'http://xyz'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['restCall']).toStrictEqual({ method: 'post', url: 'http://xyz' });
});

/**
 *
 */
it('check param definition (actionParaSetter), three paras', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        defaultSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType => {
            (value as object)[para] = rowValue;
            return value;
        }
    });

    context.config.value = {};

    const ast = variableParser.parseAction('param:para1');
    const row = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: 'para1',
        selector: undefined,
        ast,
        values_replaced: {
            value: '1'
        },
        _metaDefinition: null
    });

    const ast2 = variableParser.parseAction('param:para2');
    const row2 = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: 'para2',
        selector: undefined,
        ast: ast2,
        values_replaced: {
            value: '2'
        },
        _metaDefinition: null
    });

    const ast3 = variableParser.parseAction('param:para3');
    const row3 = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: 'para3',
        selector: undefined,
        ast: ast3,
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    sut.execute(context, row3);

    expect(context.config['value']).toBeInstanceOf(Object);
    expect(context.config['value']?.constructor.name).toBe('Object');
    expect(context.config['value']).toStrictEqual({ para1: '1', para2: '2', para3: '3' });
});

/**
 *
 */
it('use default type converter', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        defaultTypeConverter: (value: ContentType) => new ObjectContent(value)
    });

    const ast = variableParser.parseAction('method');
    const row = new RowTypePropValue<DataContext>({
        key: 'method',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'x'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config.value).toBeInstanceOf(ObjectContent);
    expect(context.config.value?.toString()).toBe('x');
});

/**
 *
 */
it('use enum value', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'type');

    const ast = variableParser.parseAction('method');
    const row = new RowTypePropValue<DataContext>({
        key: 'method',
        keyPara: undefined,
        selector: undefined,
        ast,
        values_replaced: {
            value: 'nor'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);

    expect(context.config.type).toBe(ContextType.Nor);
    expect(context.config.type).toBeString();
});
