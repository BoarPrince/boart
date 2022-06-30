import { ContentType, DataContent, DataContentHelper, ExecutionContext, NullContent } from '@boart/core';

import { DataExecutionContext } from '../../DataExecutionContext';
import { RowTypePropValue } from '../../RowTypePropValue';
import { RowTypeValue } from '../../RowTypeValue';

import { PropertySetterExecutionUnit } from './PropertySetterExecutionUnit';

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
        restCall?: RestCallContext;
    },
    {},
    DataExecutionContext
>;

/**
 *
 */
it('check (2 levels)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'xxx'
        },
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

    const context: DataContext = {
        config: null,
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'xxx'
        },
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

    const context: DataContext = {
        config: {
            value: ''
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'xxx'
        },
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('xxx');
});

/**
 *
 */
it('check set null', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: 'null',
        selector: null,
        values: {
            value: ''
        },
        values_replaced: {
            value: ''
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value']).toBeNull();
});

/**
 *
 */
it('check null initialized', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value');

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'xxx'
        },
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

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'a',
        values: {
            value: 'xxx'
        },
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

    const context: DataContext = {
        config: {
            value: new NullContent()
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'xxx'
        },
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

    const context: DataContext = {
        config: {
            value: new NullContent()
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'a',
        values: {
            value: 'xxx'
        },
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

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'xxx'
        },
        values_replaced: {
            value: 'xxx'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: null,
        values: {
            value: 'yyy'
        },
        values_replaced: {
            value: 'yyy'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value'].toString()).toBe('xxx\nyyy');
});

/**
 *
 */
it('check with selector', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: false });

    const context: DataContext = {
        config: {
            value: JSON.stringify({
                a: 'b',
                c: 'd',
                e: 3
            })
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'c',
        values: {
            value: 'f'
        },
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

    const context: DataContext = {
        config: {
            value: JSON.stringify({
                a: 'b',
                c: 'd',
                e: 3
            })
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'c',
        values: {
            value: 'f'
        },
        values_replaced: {
            value: 'f'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'e',
        values: {
            value: '4'
        },
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
it('check with actionPara (deep)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', { concat: false });

    const context: DataContext = {
        config: {
            value: JSON.stringify({
                a: {
                    f: 4
                },
                c: 'd',
                e: 3
            })
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'a.f',
        values: {
            value: '5'
        },
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

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'a.f',
        values: {
            value: '5'
        },
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('{"a":{"f":5}}');
});

/**
 *
 */
it('check with actionPara (use actionParaModifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorModifier: (rowValue) => `-${rowValue?.toString()}-`
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: null,
        selector: 'a.f',
        values: {
            value: '5'
        },
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('{"a":{"f":"-5-"}}');
});

/**
 *
 */
it('check without actionPara (use defaultModifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        defaultModifier: (rowValue) => `-${rowValue?.toString()}-`
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'a:a',
        keyPara: '',
        selector: null,
        values: {
            value: '5'
        },
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('-5-');
});

/**
 *
 */
it('check query style (actionParaSetter), one para', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorSetter: (_value: ContentType, rowValue: ContentType, para: string): ContentType => {
            return `${para}=${rowValue?.toString()}`;
        }
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'id',
        values: {
            value: '5'
        },
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('id=5');
});

/**
 *
 */
it('check query style (actionParaSetter), three paras', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType =>
            `${!value ? '' : value?.toString() + '&'}${para}=${rowValue?.toString()}`
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'id',
        values: {
            value: '5'
        },
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'id2',
        values: {
            value: '6'
        },
        values_replaced: {
            value: '6'
        },
        _metaDefinition: null
    });

    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'id3',
        values: {
            value: '7'
        },
        values_replaced: {
            value: '7'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    sut.execute(context, row3);
    expect(context.config['value'].toString()).toBe('id=5&id2=6&id3=7');
});

/**
 *
 */
it('check query style (actionParaSetter and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: false,
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType =>
            `${!value ? '' : value?.toString() + '&'}${para}=${rowValue?.toString()}`,
        actionSelectorModifier: (rowValue: ContentType): ContentType => {
            return `-${rowValue?.toString()}-`;
        }
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'id',
        values: {
            value: '5'
        },
        values_replaced: {
            value: '5'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['value'].toString()).toBe('id=-5-');
});

/**
 *
 */
it('check query style (default and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        defaultModifier: (rowValue: ContentType): ContentType => {
            return rowValue
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: '',
        selector: null,
        values: {
            value: 'a=1'
        },
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: '',
        selector: null,
        values: {
            value: 'b=2'
        },
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value'].toString()).toBe('-a-=-1-&-b-=-2-');
});

/**
 *
 */
it('check query style (default, para and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType =>
            `${!value ? '' : value?.toString() + '&'}${para}=${rowValue?.toString()}`,
        actionSelectorModifier: (rowValue: ContentType): ContentType => {
            return `-${rowValue?.toString()}-`;
        },
        defaultModifier: (rowValue: ContentType): ContentType => {
            return rowValue
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: '',
        values: {
            value: 'a=1'
        },
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: '',
        values: {
            value: 'b=2'
        },
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'c',
        values: {
            value: '3'
        },
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row2);
    sut.execute(context, row3);
    expect(context.config['value'].toString()).toBe('-a-=-1-&-b-=-2-&c=-3-');
});

/**
 *
 */
it('check query style (default, para and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType =>
            `${!value ? '' : value?.toString() + '&'}${para}=${rowValue?.toString()}`,
        actionSelectorModifier: (rowValue: ContentType): ContentType => {
            return `-${rowValue?.toString()}-`;
        },
        defaultModifier: (rowValue: ContentType): ContentType => {
            return rowValue
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: '',
        values: {
            value: 'a=1'
        },
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: '',
        values: {
            value: 'b=2'
        },
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'c',
        values: {
            value: '3'
        },
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row3);
    sut.execute(context, row);
    sut.execute(context, row2);
    expect(context.config['value'].toString()).toBe('c=-3-&-a-=-1-&-b-=-2-');
});

/**
 *
 */
it('check query style (default, para, default and modifier)', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        concat: true,
        delimiter: '&',
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType =>
            `${!value ? '' : value?.toString() + '&'}${para}=${rowValue?.toString()}`,
        actionSelectorModifier: (rowValue: ContentType): ContentType => {
            return `-${rowValue?.toString()}-`;
        },
        defaultModifier: (rowValue: ContentType): ContentType => {
            return rowValue
                .toString()
                .split('=')
                .map((value) => `-${value}-`)
                .join('=');
        }
    });

    const context: DataContext = {
        config: {
            value: null
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: '',
        values: {
            value: 'a=1'
        },
        values_replaced: {
            value: 'a=1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: '',
        values: {
            value: 'b=2'
        },
        values_replaced: {
            value: 'b=2'
        },
        _metaDefinition: null
    });

    const row3 = new RowTypePropValue<DataContext>({
        key: 'query',
        keyPara: null,
        selector: 'c',
        values: {
            value: '3'
        },
        values_replaced: {
            value: '3'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    sut.execute(context, row3);
    sut.execute(context, row2);
    expect(context.config['value'].toString()).toBe('-a-=-1-&c=-3-&-b-=-2-');
});

/**
 *
 */
it('check method/url style', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'restCall', {
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): RestCallContext => ({
            method: para,
            url: rowValue.toString()
        })
    });

    const context: DataContext = {
        config: {
            value: null,
            restCall: {
                url: '',
                method: ''
            }
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'method',
        keyPara: null,
        selector: 'post',
        values: {
            value: 'http://xyz'
        },
        values_replaced: {
            value: 'http://xyz'
        },
        _metaDefinition: null
    });

    sut.execute(context, row);
    expect(context.config['restCall']).toEqual({ method: 'post', url: 'http://xyz' });
});

/**
 *
 */
it('check param definition (actionParaSetter), three paras', () => {
    const sut = new PropertySetterExecutionUnit<DataContext, RowTypeValue<DataContext>>('config', 'value', {
        actionSelectorSetter: (value: ContentType, rowValue: ContentType, para: string): ContentType => {
            (value as object)[para] = rowValue;
            return value;
        }
    });

    const context: DataContext = {
        config: {
            value: {}
        },
        preExecution: null,
        execution: null
    };

    const row = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: null,
        selector: 'para1',
        values: {
            value: '1'
        },
        values_replaced: {
            value: '1'
        },
        _metaDefinition: null
    });

    const row2 = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: null,
        selector: 'para2',
        values: {
            value: '2'
        },
        values_replaced: {
            value: '2'
        },
        _metaDefinition: null
    });

    const row3 = new RowTypePropValue<DataContext>({
        key: 'param',
        keyPara: null,
        selector: 'para3',
        values: {
            value: '3'
        },
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
    expect(context.config['value']).toEqual({ para1: '1', para2: '2', para3: '3' });
});
