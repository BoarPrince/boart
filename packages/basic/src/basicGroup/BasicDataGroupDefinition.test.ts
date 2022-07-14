import 'jest-extended';

import {
    ExecutionContext,
    MarkdownTableReader,
    NullContent,
    ObjectContent,
    ParaType,
    RowDefinition,
    SelectorType,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType,
    TextContent
} from '@boart/core';
import { DataExecutionContext, PropertySetterExecutionUnit, RowTypeValue } from '@boart/core-impl';
import { DataPreExecutionContext } from '@boart/core-impl/src/DataExecutionContext';

import BasicGroupDefinition from './BasicDataGroupDefinition';

/**
 *
 */
export type MockContext = ExecutionContext<
    {
        confValue: string;
    },
    DataPreExecutionContext & {
        preValue: string;
    },
    DataExecutionContext
>;

/**
 *
 */
class MockTableHandler extends TableHandlerBaseImpl<MockContext, RowTypeValue<MockContext>> {
    /**
     *
     */
    protected rowType = () => RowTypeValue;

    /**
     *
     */
    protected mainExecutionUnit = () => ({
        description: 'mock handler',
        execute: jest.fn()
    });

    /**
     *
     */
    protected newContext = () => ({
        config: {
            confValue: ''
        },
        preExecution: {
            preValue: '',
            payload: null
        },
        execution: {
            data: null,
            transformed: null,
            header: null
        }
    });

    /**
     *
     */
    protected addGroupRowDefinition(tableHandler: TableHandler<MockContext, RowTypeValue<MockContext>>) {
        tableHandler.addGroupRowDefinition(BasicGroupDefinition);
    }

    /**
     *
     */
    protected addRowDefinition(tableHandler: TableHandler<MockContext, RowTypeValue<MockContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('pre:exec'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new PropertySetterExecutionUnit<MockContext, RowTypeValue<MockContext>>('preExecution', 'preValue'),
                validators: null
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('data:config'),
                type: TableRowType.PreProcessing,
                selectorType: SelectorType.Optional,
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<MockContext, RowTypeValue<MockContext>>('execution', 'data'),
                validators: null
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('header:config'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<MockContext, RowTypeValue<MockContext>>('execution', 'header'),
                validators: null
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('transformed:config'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<MockContext, RowTypeValue<MockContext>>('execution', 'transformed'),
                validators: null
            })
        );
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected addGroupValidation(_tableHandler: TableHandler<MockContext, RowTypeValue<MockContext>>) {
        // no validation needed for test purposes
    }
}

/**
 *
 */
const sut = new MockTableHandler();

/**
 *
 */
it('wrong action key must throw an error', async () => {
    const tableDef = MarkdownTableReader.convert(
        `|action       |value  |
         |-------------|-------|
         |wrong action |       |`
    );

    await expect(async () => {
        await sut.handler.process(tableDef);
    }).rejects.toThrowError(`'undefined': key 'wrong action' is not valid`);
});

/**
 *
 */
describe('check expected,expected:data', () => {
    /**
     *
     */
    it('expected:data can check value defined by config unit', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action       |value |
             |-------------|------|
             |data:config  |xyz   |
             |expected:data|xyz   |`
        );

        const context = await sut.handler.process(tableDef);
        expect(context.execution.data.toString()).toBe('xyz');
    });

    /**
     *
     */
    it('expected:data can check complete value - correct', async () => {
        sut.handler.executionEngine.context.execution.data = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action       |value  |
             |-------------|-------|
             |expected:data|xxx    |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('expected can check complete value - correct', async () => {
        sut.handler.executionEngine.context.execution.data = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action   |value  |
             |---------|-------|
             |expected |xxx    |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('expected:data can check complete value - incorrect', async () => {
        sut.handler.executionEngine.context.execution.data = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action       |value  |
             |-------------|-------|
             |expected:data|x-x-x  |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`error: expected:data\n\texpected: x-x-x\n\tactual: xxx`);
    });
    /**
     *
     */
    it('expected:data can check complete value - negate', async () => {
        sut.handler.executionEngine.context.execution.data = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action           |value  |
             |-----------------|-------|
             |expected:data:not|x-x-x  |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('expected:data can check value with selector', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 'xyz' });

        const tableDef = MarkdownTableReader.convert(
            `|action         |value |
             |---------------|------|
             |expected:data#a|xyz   |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('expected:data can check value with selector - incorrect', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 'xy' });

        const tableDef = MarkdownTableReader.convert(
            `|action         |value |
             |---------------|------|
             |expected:data#a|xyz   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`error: expected:data\n\texpected: xyz\n\tactual: xy`);
    });

    /**
     *
     */
    it('expected:data can check value without selector, but it is expected - incorrect', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 'xyz' });

        const tableDef = MarkdownTableReader.convert(
            `|action         |value |
             |---------------|------|
             |expected:data  |xyz   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`error: expected:data\n\texpected: xyz\n\tactual: {"a":"xyz"}`);
    });

    /**
     *
     */
    it('expected:data can check value with selector and regexp', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 'aabaa' });

        const tableDef = MarkdownTableReader.convert(
            `|action                |value |
             |----------------------|------|
             |expected:data:regexp#a|.+b.+ |`
        );

        await sut.handler.process(tableDef);
    });
});

/**
 *
 */
describe('check expected:header', () => {
    /**
     *
     */
    it('expected:header can check value defined by config unit', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action         |value |
             |---------------|------|
             |header:config  |xyz   |
             |expected:header|xyz   |`
        );

        const context = await sut.handler.process(tableDef);
        expect(context.execution.header.toString()).toBe('xyz');
    });

    /**
     *
     */
    it('expected:header can check complete value - correct', async () => {
        sut.handler.executionEngine.context.execution.header = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action         |value  |
             |---------------|-------|
             |expected:header|xxx    |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('expected:header can check complete value - incorrect', async () => {
        sut.handler.executionEngine.context.execution.header = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action         |value  |
             |---------------|-------|
             |expected:header|x-x-x  |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`error: expected:header\n\texpected: x-x-x\n\tactual: xxx`);
    });

    /**
     *
     */
    it('expected:header can check value with selector', async () => {
        sut.handler.executionEngine.context.execution.header = new ObjectContent({ a: 'xyz' });

        const tableDef = MarkdownTableReader.convert(
            `|action           |value |
             |-----------------|------|
             |expected:header#a|xyz   |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('expected:header can check value with selector - incorrect', async () => {
        sut.handler.executionEngine.context.execution.header = new ObjectContent({ a: 'xy' });

        const tableDef = MarkdownTableReader.convert(
            `|action           |value |
             |-----------------|------|
             |expected:header#a|xyz   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`error: expected:header\n\texpected: xyz\n\tactual: xy`);
    });

    /**
     *
     */
    it('expected:header can check value without selector, but it is expected - incorrect', async () => {
        sut.handler.executionEngine.context.execution.header = new ObjectContent({ a: 'xyz' });

        const tableDef = MarkdownTableReader.convert(
            `|action           |value |
             |-----------------|------|
             |expected:header  |xyz   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`error: expected:header\n\texpected: xyz\n\tactual: {"a":"xyz"}`);
    });
});

/**
 *
 */
describe('check expected:transformed', () => {
    /**
     *
     */
    it('expected:header can check value defined by config unit', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action              |value |
             |--------------------|------|
             |transformed:config  |xyz   |
             |expected:transformed|xyz   |`
        );

        const context = await sut.handler.process(tableDef);
        expect(context.execution.transformed.toString()).toBe('xyz');
    });

    /**
     *
     */
    it('expected:header can check complete value - correct', async () => {
        sut.handler.executionEngine.context.execution.transformed = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action              |value  |
             |--------------------|-------|
             |expected:transformed|xxx    |`
        );

        await sut.handler.process(tableDef);
    });
});

/**
 *
 */
describe('check expected operators', () => {
    /**
     *
     */
    it('default operator', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action       |value |
             |-------------|------|
             |data:config  |xyz   |
             |expected     |xyz   |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('default negate operator', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action       |value |
             |-------------|------|
             |data:config  |xyz   |
             |expected:not |zyx   |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('null operator', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action           |value |
             |-----------------|------|
             |data:config:null |      |
             |expected:null    |      |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('null operator - falure', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action        |value |
             |--------------|------|
             |data:config   |xyz   |
             |expected:null |xyz   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError("error: expected, null: actual: 'xyz'");
    });

    /**
     *
     */
    it('count operator, object', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 'a', b: 'a', c: 'a' });

        const tableDef = MarkdownTableReader.convert(
            `|action         |value |
             |---------------|------|
             |expected:count | 3    |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('not:count header operator, object', async () => {
        sut.handler.executionEngine.context.execution.header = new ObjectContent({ a: 'a', b: 'a', c: 'a' });

        const tableDef = MarkdownTableReader.convert(
            `|action                    |value |
             |--------------------------|------|
             |expected:header:not:count | 3    |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError("error: expected:header, value: 3, actual: keys: 'a,b,c'");
    });

    /**
     *
     */
    it('count operator, array', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent(['a', 'b', 'c']);

        const tableDef = MarkdownTableReader.convert(
            `|action         |value |
             |---------------|------|
             |expected:count | 3    |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('not:count header operator, array', async () => {
        sut.handler.executionEngine.context.execution.header = new ObjectContent(['a', 'b', 'c']);

        const tableDef = MarkdownTableReader.convert(
            `|action                    |value |
             |--------------------------|------|
             |expected:header:not:count | 3    |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError("error: expected:header, value: 3, actual: indexes: '0,1,2'");
    });
});

/**
 *
 */
describe('check expected JsonLogic', () => {
    /**
     *
     */
    it('uninitialized', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                  |value                            |
             |------------------------|---------------------------------|
             |expected:jsonLogic:true |{ "===" : [{"var": ""}, "xyz"] } |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('jsonLogic expression must be true: "{ \\"===\\" : [{\\"var\\": \\"\\"}, \\"xyz\\"] }"');
    });

    /**
     *
     */
    it('null', async () => {
        sut.handler.executionEngine.context.execution.data = new NullContent();
        sut.handler.executionEngine.context.execution.transformed = new NullContent();

        const tableDef = MarkdownTableReader.convert(
            `|action                  |value                            |
             |------------------------|---------------------------------|
             |expected:jsonLogic:true |{ "===" : [{"var": ""}, "xyz"] } |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('jsonLogic expression must be true: "{ \\"===\\" : [{\\"var\\": \\"\\"}, \\"xyz\\"] }"');
    });

    /**
     *
     */
    it('default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                  |value                            |
             |------------------------|---------------------------------|
             |data:config             |xyz                              |
             |expected:jsonLogic:true |{ "===" : [{"var": ""}, "xyz"] } |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('default false', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                   |value                            |
             |-------------------------|---------------------------------|
             |data:config              |xyz                              |
             |expected:jsonLogic:false |{ "===" : [{"var": ""}, "xyy"] } |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('default, object as string', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                  |value                             |
             |------------------------|----------------------------------|
             |data:config             |{"a": "bcd"}                      |
             |expected:jsonLogic:true |{ "===" : [{"var": "a"}, "bcd"] } |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('default, object with selector', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                  |value                             |
             |------------------------|----------------------------------|
             |data:config#a           |bcd                               |
             |expected:jsonLogic:true |{ "===" : [{"var": "a"}, "bcd"] } |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('default, object with selector, failure', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                  |value                             |
             |------------------------|----------------------------------|
             |data:config#a           |bcd                               |
             |expected:jsonLogic:true |{ "===" : [{"var": "a"}, "bce"] } |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('jsonLogic expression must be true: "{ \\"===\\" : [{\\"var\\": \\"a\\"}, \\"bce\\"] }"');
    });
});

/**
 *
 */
describe('check transformed jpath', () => {
    /**
     *
     */
    beforeEach(() => {
        sut.handler.executionEngine.context.execution.data = new NullContent();
        sut.handler.executionEngine.context.execution.transformed = new NullContent();
    });

    /**
     *
     */
    it('not initialized', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        sut.handler.executionEngine.context.execution.data = undefined as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        sut.handler.executionEngine.context.execution.transformed = undefined as any;

        const tableDef = MarkdownTableReader.convert(
            `|action          |value |
             |----------------|------|
             |transform:jpath | .b   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError("cannot evaluate jpath expression, rule: '.b', data: null");
    });

    /**
     *
     */
    it('null', async () => {
        sut.handler.executionEngine.context.execution.data = new NullContent();
        sut.handler.executionEngine.context.execution.transformed = new NullContent();

        const tableDef = MarkdownTableReader.convert(
            `|action          |value |
             |----------------|------|
             |transform:jpath | .b   |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError("cannot evaluate jpath expression, rule: '.b', data: null");
    });

    /**
     *
     */
    it('default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action          |value |
             |----------------|------|
             |data:config#a   | d    |
             |data:config#b   | e    |
             |transform:jpath | .b   |`
        );

        const result = await sut.handler.process(tableDef);
        expect(result.execution.transformed).toBeInstanceOf(TextContent);
        expect(result.execution.transformed.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep data', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action            |value |
             |------------------|------|
             |data:config#b.c.d | e    |
             |transform:jpath   | .b   |`
        );

        const result = await sut.handler.process(tableDef);
        expect(result.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(result.execution.transformed.toJSON()).toBe('{"c":{"d":"e"}}');
    });

    /**
     *
     */
    it('deep key and data', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action            |value   |
             |------------------|--------|
             |data:config#b.c.d | e      |
             |transform:jpath   | .b.c.d |`
        );

        const result = await sut.handler.process(tableDef);
        expect(result.execution.transformed).toBeInstanceOf(TextContent);
        expect(result.execution.transformed.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep data and expect jsonlogic', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                              |value                               |
             |------------------------------------|------------------------------------|
             |data:config#b.c.d                   | e                                  |
             |transform:jpath                     | .b                                 |
             |expected:jsonLogic:transformed:true | { "===" : [ {"var": "c.d"}, "e" ]} |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('deep data and expected default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action            |value               |
             |------------------|--------------------|
             |data:config#b.c.d | e                  |
             |transform:jpath   | .b                 |
             |expected:transformed | {"c":{"d":"e"}} |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('deep data and expected not empty', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                         |value|
             |-------------------------------|-----|
             |data:config#b.c.d              | e   |
             |transform:jpath                | .b  |
             |expected:transformed:not:empty |     |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('deep data and expected empty with failure', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                     |value|
             |---------------------------|-----|
             |data:config#b.c.d          | e   |
             |transform:jpath            | .b  |
             |expected:transformed:empty |     |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('error: expected:transformed\n\texpected:empty: \n\tactual: {"c":{"d":"e"}}');
    });

    /**
     *
     */
    it('transforming chain', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action             |value|
             |---------------------|-----|
             |data:config#b.c.d    | e   |
             |transform:jpath      | .b  |
             |transform:jpath      | .c  |
             |transform:jpath      | .d  |
             |expected:transformed | e   |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('reset', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action               |value                  |
             |---------------------|-----------------------|
             |data:config#b.c.d    | e                     |
             |transform:jpath      | .b                    |
             |expected:transformed | {"c":{"d":"e"}}       |
             |transform:reset      |                       |
             |expected:transformed | {"b":{"c":{"d":"e"}}} |`
        );

        await sut.handler.process(tableDef);
    });
});

/**
 *
 */
describe('check transformed jsonLogic', () => {
    /**
     *
     */
    beforeEach(() => {
        sut.handler.executionEngine.context.execution.data = new NullContent();
        sut.handler.executionEngine.context.execution.transformed = new NullContent();
    });

    /**
     *
     */
    it('not initialized', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        sut.handler.executionEngine.context.execution.data = undefined as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        sut.handler.executionEngine.context.execution.transformed = undefined as any;

        const tableDef = MarkdownTableReader.convert(
            `|action              |value         |
             |--------------------|--------------|
             |transform:jsonLogic | {"var": "b"} |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('null', async () => {
        sut.handler.executionEngine.context.execution.data = new NullContent();
        sut.handler.executionEngine.context.execution.transformed = new NullContent();

        const tableDef = MarkdownTableReader.convert(
            `|action              |value         |
             |--------------------|--------------|
             |transform:jsonLogic | {"var": "b"} |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('wrong rule', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action              |value        |
             |--------------------|-------------|
             |transform:jsonLogic | {"var": "b" |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('cannot parse rule: {"var": "b"');
    });

    /**
     *
     */
    it('default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action              |value         |
             |--------------------|--------------|
             |data:config#a       | d            |
             |data:config#b       | e            |
             |transform:jsonLogic | {"var": "b"} |`
        );

        const result = await sut.handler.process(tableDef);
        expect(result.execution.transformed).toBeInstanceOf(TextContent);
        expect(result.execution.transformed.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep data', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action              |value         |
             |--------------------|--------------|
             |data:config#b.c.d   | e            |
             |transform:jsonLogic | {"var": "b"} |`
        );

        const result = await sut.handler.process(tableDef);
        expect(result.execution.transformed).toBeInstanceOf(ObjectContent);
        expect(result.execution.transformed.toJSON()).toBe('{"c":{"d":"e"}}');
    });

    /**
     *
     */
    it('deep key and data', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action              |value             |
             |--------------------|------------------|
             |data:config#b.c.d   | e                |
             |transform:jsonLogic | {"var": "b.c.d"} |`
        );

        const result = await sut.handler.process(tableDef);
        expect(result.execution.transformed).toBeInstanceOf(TextContent);
        expect(result.execution.transformed.toString()).toBe('e');
    });

    /**
     *
     */
    it('deep data and expect jsonpath', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                              |value                               |
             |------------------------------------|------------------------------------|
             |data:config#b.c.d                   | e                                  |
             |transform:jsonLogic                 | {"var": "b"}                       |
             |expected:jsonLogic:transformed:true | { "===" : [ {"var": "c.d"}, "e" ]} |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('deep data and expected default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action               |value            |
             |---------------------|-----------------|
             |data:config#b.c.d    | e               |
             |transform:jsonLogic  | {"var": "b"}    |
             |expected:transformed | {"c":{"d":"e"}} |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('deep data and expected not empty', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                         |value         |
             |-------------------------------|--------------|
             |data:config#b.c.d              | e            |
             |transform:jsonLogic            | {"var": "b"} |
             |expected:transformed:not:empty |              |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('deep data and expected empty with failure', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action                     |value         |
             |---------------------------|--------------|
             |data:config#b.c.d          | e            |
             |transform:jsonLogic        | {"var": "b"} |
             |expected:transformed:empty |              |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('error: expected:transformed\n\texpected:empty: \n\tactual: {"c":{"d":"e"}}');
    });

    /**
     *
     */
    it('transforming chain', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action               |value         |
             |---------------------|--------------|
             |data:config#b.c.d    | e            |
             |transform:jsonLogic  | {"var": "b"} |
             |transform:jsonLogic  | {"var": "c"} |
             |transform:jsonLogic  | {"var": "d"} |
             |expected:transformed | e            |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('reset', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action               |value                  |
             |---------------------|-----------------------|
             |data:config#b.c.d    | e                     |
             |transform:jsonLogic  | {"var": "b"}          |
             |expected:transformed | {"c":{"d":"e"}}       |
             |transform:reset      |                       |
             |expected:transformed | {"b":{"c":{"d":"e"}}} |`
        );

        await sut.handler.process(tableDef);
    });
});
