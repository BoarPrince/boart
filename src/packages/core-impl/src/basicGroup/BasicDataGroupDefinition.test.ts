/* eslint-disable jest/expect-expect */
import 'jest-extended';

import {
    DataContent,
    DefaultExecutionContext,
    DefaultPreExecutionContext,
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
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

import BasicGroupDefinition from './BasicDataGroupDefinition';

/**
 *
 */
type MockContext = ExecutionContext<
    {
        confValue: string;
    },
    DefaultPreExecutionContext & {
        preValue: string;
    },
    DefaultExecutionContext
>;

/**
 *
 */
const intialContext = {
    data: null,
    header: null,
    transformed: null
};

/**
 *
 */
class MockTableHandler extends TableHandlerBaseImpl<MockContext, DefaultRowType<MockContext>> {
    /**
     *
     */
    protected rowType = () => DefaultRowType;

    /**
     *
     */
    protected mainExecutionUnit = () => ({
        key: Symbol('mock handler'),
        description: () => ({
            id: '78d7a946-01db-4b38-8fd9-ca5ff00f5c62',
            description: null,
            examples: null
        }),
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
            data: intialContext.data,
            transformed: intialContext.transformed,
            header: intialContext.header
        }
    });

    /**
     *
     */
    protected addGroupRowDefinition(tableHandler: TableHandler<MockContext, DefaultRowType<MockContext>>) {
        tableHandler.addGroupRowDefinition(BasicGroupDefinition);
    }

    /**
     *
     */
    protected addRowDefinition(tableHandler: TableHandler<MockContext, DefaultRowType<MockContext>>) {
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('pre:exec'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.Optional,
                executionUnit: new DefaultPropertySetterExecutionUnit<MockContext, DefaultRowType<MockContext>>('preExecution', 'preValue'),
                validators: null
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('data:config'),
                type: TableRowType.PreProcessing,
                selectorType: SelectorType.Optional,
                parameterType: ParaType.False,
                executionUnit: new DefaultPropertySetterExecutionUnit<MockContext, DefaultRowType<MockContext>>('execution', 'data'),
                validators: null
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('header:config'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new DefaultPropertySetterExecutionUnit<MockContext, DefaultRowType<MockContext>>('execution', 'header'),
                validators: null
            })
        );
        tableHandler.addRowDefinition(
            new RowDefinition({
                key: Symbol('transformed:config'),
                type: TableRowType.PreProcessing,
                parameterType: ParaType.False,
                executionUnit: new DefaultPropertySetterExecutionUnit<MockContext, DefaultRowType<MockContext>>('execution', 'transformed'),
                validators: null
            })
        );
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected addGroupValidation(_tableHandler: TableHandler<MockContext, DefaultRowType<MockContext>>) {
        // no validation needed for test purposes
    }
}

/**
 *
 */
const sut = new MockTableHandler();

describe('basic group definition', () => {
    /**
     *
     */
    beforeEach(() => {
        intialContext.data = null;
        intialContext.header = null;
        intialContext.transformed = null;
    });

    /**
     *
     */
    it('wrong action key must throw an error', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action       |value  |
             |-------------|-------|
             |wrong-action |       |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrow(`'undefined': key 'wrong-action' is not valid`);
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
                `|action        |value |
                 |--------------|------|
                 |data:config   |xyz   |
                 |expected::data|xyz   |`
            );

            const context = await sut.handler.process(tableDef);
            expect(context.execution.data?.toString()).toBe('xyz');
        });

        /**
         *
         */
        it('expected:data can check complete value - correct', async () => {
            intialContext.data = new TextContent('xxx');

            const tableDef = MarkdownTableReader.convert(
                `|action        |value  |
                 |--------------|-------|
                 |expected::data|xxx    |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected can check complete value - correct', async () => {
            intialContext.data = new TextContent('xxx');

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
            intialContext.data = new TextContent('xxx');

            const tableDef = MarkdownTableReader.convert(
                `|action        |value  |
                 |--------------|-------|
                 |expected::data|x-x-x  |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected::data\n\texpected: x-x-x\n\tactual: xxx`);
        });

        /**
         *
         */
        it('expected:data can check complete value - negate', async () => {
            sut.handler.getExecutionEngine().context.execution.data = new TextContent('xxx');

            const tableDef = MarkdownTableReader.convert(
                `|action            |value  |
                 |------------------|-------|
                 |expected:not::data|x-x-x  |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:data can check value with selector', async () => {
            intialContext.data = new ObjectContent({ a: 'xyz' });

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
                 |----------------|------|
                 |expected::data#a|xyz   |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:contains a null value', async () => {
            intialContext.data = new ObjectContent({ a: null, b: 1 });

            const tableDef = MarkdownTableReader.convert(
                `|action            |value |
             |------------------|------|
             |expected:contains |null  |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:contains a none null value', async () => {
            intialContext.data = new ObjectContent({ a: 1, b: 2 });

            const tableDef = MarkdownTableReader.convert(
                `|action                |value |
             |----------------------|------|
             |expected:contains:not |null  |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:contains a 0 value', async () => {
            intialContext.data = new ObjectContent({ a: 0, b: 1 });

            const tableDef = MarkdownTableReader.convert(
                `|action            |value |
             |------------------|------|
             |expected:contains |0     |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:contains a none 0 value', async () => {
            intialContext.data = new ObjectContent({ a: 1, b: 2 });

            const tableDef = MarkdownTableReader.convert(
                `|action                |value |
             |----------------------|------|
             |expected:contains:not |0     |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:data can check value with selector - incorrect', async () => {
            intialContext.data = new ObjectContent({ a: 'xy' });

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
                 |----------------|------|
                 |expected::data#a|xyz   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected::data#a\n\texpected: xyz\n\tactual: xy`);
        });

        /**
         *
         */
        it('expected:data can check value without selector, but it is expected - incorrect', async () => {
            intialContext.data = new ObjectContent({ a: 'xyz' });

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
                 |----------------|------|
                 |expected::data  |xyz   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected::data\n\texpected: xyz\n\tactual: {"a":"xyz"}`);
        });

        /**
         *
         */
        it('expected:data can check value with selector and regexp', async () => {
            intialContext.data = new ObjectContent({ a: 'aabaa' });

            const tableDef = MarkdownTableReader.convert(
                `|action                 |value |
                 |-----------------------|------|
                 |expected:regexp::data#a|.+b.+ |`
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
                `|action          |value |
                 |----------------|------|
                 |header:config   |xyz   |
                 |expected::header|xyz   |`
            );

            const context = await sut.handler.process(tableDef);
            expect(context.execution.header?.toString()).toBe('xyz');
        });

        /**
         *
         */
        it('expected:header can check complete value - correct', async () => {
            intialContext.header = new TextContent('xxx');

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
                 |----------------|------|
                 |expected::header|xxx   |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:header can check complete value - incorrect', async () => {
            intialContext.header = new TextContent('xxx');

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
                 |----------------|------|
                 |expected::header|x-x-x |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected::header\n\texpected: x-x-x\n\tactual: xxx`);
        });

        /**
         *
         */
        it('expected:header can check value with selector', async () => {
            intialContext.header = new ObjectContent({ a: 'xyz' });

            const tableDef = MarkdownTableReader.convert(
                `|action            |value |
                 |------------------|------|
                 |expected::header#a|xyz   |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected:header can check value with selector - incorrect', async () => {
            intialContext.header = new ObjectContent({ a: 'xy' });

            const tableDef = MarkdownTableReader.convert(
                `|action            |value |
                 |------------------|------|
                 |expected::header#a|xyz   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected::header#a\n\texpected: xyz\n\tactual: xy`);
        });

        /**
         *
         */
        it('expected:header can check value without selector, but it is expected - incorrect', async () => {
            intialContext.header = new ObjectContent({ a: 'xyz' });

            const tableDef = MarkdownTableReader.convert(
                `|action            |value |
                 |------------------|------|
                 |expected::header  |xyz   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected::header\n\texpected: xyz\n\tactual: {"a":"xyz"}`);
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
                `|action               |value |
                 |---------------------|------|
                 |transformed:config   |xyz   |
                 |expected::transformed|xyz   |`
            );

            const context = await sut.handler.process(tableDef);
            expect(context.execution.transformed?.toString()).toBe('xyz');
        });

        /**
         *
         */
        it('expected:header can check complete value - correct', async () => {
            intialContext.transformed = new TextContent('xxx');

            const tableDef = MarkdownTableReader.convert(
                `|action               |value |
                 |---------------------|------|
                 |expected::transformed|xxx   |`
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
        it('null operator - falure', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action        |value |
                 |--------------|------|
                 |data:config   |xyz   |
                 |expected:null |xyz   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow("error: expected:null, null: actual: 'xyz'");
        });

        /**
         *
         */
        it('count operator, object', async () => {
            intialContext.data = new ObjectContent({ a: 'a', b: 'a', c: 'a' });

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
            intialContext.header = new ObjectContent({ a: 'a', b: 'a', c: 'a' });

            const tableDef = MarkdownTableReader.convert(
                `|action                     |value |
                 |---------------------------|------|
                 |expected:count:not::header | 3    |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow('error: expected:count:not::header\n\tcount:not: 3');
        });

        /**
         *
         */
        it('count operator, array', async () => {
            intialContext.data = new ObjectContent(['a', 'b', 'c']);

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
            intialContext.header = new ObjectContent(['a', 'b', 'c']);

            const tableDef = MarkdownTableReader.convert(
                `|action                     |value |
                 |---------------------------|------|
                 |expected:count:not::header | 3    |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow('error: expected:count:not::header\n\tcount:not: 3');
        });

        /**
         *
         */
        it('expected int', async () => {
            intialContext.data = new ObjectContent({ a: '11', b: 11, c: '1-1' });

            const tableDef = MarkdownTableReader.convert(
                `|action             |value |
                 |-------------------|------|
                 |expected:int#a     |      |
                 |expected:int#b     |      |
                 |expected:int:not#c |      |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected number', async () => {
            intialContext.data = new ObjectContent({ a: '11', b: 11, c: '11.1', d: 11.1, e: '11.1.1' });

            const tableDef = MarkdownTableReader.convert(
                `|action                |value |
                 |----------------------|------|
                 |expected:number#a     |      |
                 |expected:number#b     |      |
                 |expected:number#c     |      |
                 |expected:number#d     |      |
                 |expected:number:not#e |      |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('expected string', async () => {
            intialContext.data = new ObjectContent({ a: '11', b: 'dd', c: '11.1', d: 11.1 });

            const tableDef = MarkdownTableReader.convert(
                `|action                |value |
                 |----------------------|------|
                 |expected:string:not#a |      |
                 |expected:string#b     |      |
                 |expected:string:not#c |      |
                 |expected:string:not#d |      |`
            );

            await sut.handler.process(tableDef);
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
            }).rejects.toThrow('jsonLogic expression must be true: "{ \\"===\\" : [{\\"var\\": \\"\\"}, \\"xyz\\"] }"');
        });

        /**
         *
         */
        it('null', async () => {
            sut.handler.getExecutionEngine().context.execution.data = new NullContent();
            sut.handler.getExecutionEngine().context.execution.transformed = new NullContent();

            const tableDef = MarkdownTableReader.convert(
                `|action                  |value                            |
                 |------------------------|---------------------------------|
                 |expected:jsonLogic:true |{ "===" : [{"var": ""}, "xyz"] } |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow('jsonLogic expression must be true: "{ \\"===\\" : [{\\"var\\": \\"\\"}, \\"xyz\\"] }"');
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
            }).rejects.toThrow('jsonLogic expression must be true: "{ \\"===\\" : [{\\"var\\": \\"a\\"}, \\"bce\\"] }"');
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
            intialContext.data = new NullContent();
            intialContext.header = null;
            intialContext.transformed = new NullContent();
        });

        /**
         *
         */
        it('not initialized', async () => {
            intialContext.data = undefined;
            intialContext.transformed = undefined;

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
             |----------------|------|
             |transform:jpath | .b   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow("cannot evaluate jpath expression, rule: '.b', data: null");
        });

        /**
         *
         */
        it('null', async () => {
            sut.handler.getExecutionEngine().context.execution.data = new NullContent();
            sut.handler.getExecutionEngine().context.execution.transformed = new NullContent();

            const tableDef = MarkdownTableReader.convert(
                `|action          |value |
             |----------------|------|
             |transform:jpath | .b   |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow("cannot evaluate jpath expression, rule: '.b', data: null");
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
            expect(result.execution.transformed?.toString()).toBe('e');
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect((result.execution.transformed as DataContent)?.toJSON()).toBe('{"c":{"d":"e"}}');
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
            expect(result.execution.transformed?.toString()).toBe('e');
        });

        /**
         *
         */
        it('deep data and expect jsonlogic', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                               |value                               |
                 |-------------------------------------|------------------------------------|
                 |data:config#b.c.d                    | e                                  |
                 |transform:jpath                      | .b                                 |
                 |expected:jsonLogic:true::transformed | { "===" : [ {"var": "c.d"}, "e" ]} |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('deep data and expected default', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                |value               |
                 |----------------------|--------------------|
                 |data:config#b.c.d     | e                  |
                 |transform:jpath       | .b                 |
                 |expected::transformed | {"c":{"d":"e"}} |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('deep data and expected not empty', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                          |value|
                 |--------------------------------|-----|
                 |data:config#b.c.d               | e   |
                 |transform:jpath                 | .b  |
                 |expected:empty:not::transformed |     |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('deep data and expected empty with failure', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                      |value|
                 |----------------------------|-----|
                 |data:config#b.c.d           | e   |
                 |transform:jpath             | .b  |
                 |expected:empty::transformed |     |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow(`error: expected:empty::transformed\n\tempty: \n\tactual: {"c":{"d":"e"}}`);
        });

        /**
         *
         */
        it('transforming chain', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                |value|
                 |----------------------|-----|
                 |data:config#b.c.d     | e   |
                 |transform:jpath       | .b  |
                 |transform:jpath       | .c  |
                 |transform:jpath       | .d  |
                 |expected::transformed | e   |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('reset', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                |value                  |
                 |----------------------|-----------------------|
                 |data:config#b.c.d     | e                     |
                 |transform:jpath       | .b                    |
                 |expected::transformed | {"c":{"d":"e"}}       |
                 |transform:reset       |                       |
                 |expected::transformed | {"b":{"c":{"d":"e"}}} |`
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
            intialContext.data = new NullContent();
            intialContext.header = null;
            intialContext.transformed = new NullContent();
        });

        /**
         *
         */
        it('not initialized', async () => {
            intialContext.data = undefined;
            intialContext.header = null;
            intialContext.transformed = undefined;

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
            }).rejects.toThrow('cannot parse rule: {"var": "b"');
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
            expect(result.execution.transformed?.toString()).toBe('e');
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect((result.execution.transformed as DataContent)?.toJSON()).toBe('{"c":{"d":"e"}}');
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
            expect(result.execution.transformed?.toString()).toBe('e');
        });

        /**
         *
         */
        it('deep data and expect jsonpath', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                               |value                               |
                 |-------------------------------------|------------------------------------|
                 |data:config#b.c.d                    | e                                  |
                 |transform:jsonLogic                  | {"var": "b"}                       |
                 |expected:jsonLogic:true::transformed | { "===" : [ {"var": "c.d"}, "e" ]} |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('deep data and expected default', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                |value            |
                 |----------------------|-----------------|
                 |data:config#b.c.d     | e               |
                 |transform:jsonLogic   | {"var": "b"}    |
                 |expected::transformed | {"c":{"d":"e"}} |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('deep data and expected not empty', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                          |value         |
                 |--------------------------------|--------------|
                 |data:config#b.c.d               | e            |
                 |transform:jsonLogic             | {"var": "b"} |
                 |expected:empty:not::transformed |              |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('deep data and expected empty with failure', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                      |value         |
                 |----------------------------|--------------|
                 |data:config#b.c.d           | e            |
                 |transform:jsonLogic         | {"var": "b"} |
                 |expected:empty::transformed |              |`
            );

            await expect(async () => {
                await sut.handler.process(tableDef);
            }).rejects.toThrow('error: expected:empty::transformed\n\tempty: \n\tactual: {"c":{"d":"e"}}');
        });

        /**
         *
         */
        it('transforming chain', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                |value         |
                 |----------------------|--------------|
                 |data:config#b.c.d     | e            |
                 |transform:jsonLogic   | {"var": "b"} |
                 |transform:jsonLogic   | {"var": "c"} |
                 |transform:jsonLogic   | {"var": "d"} |
                 |expected::transformed | e            |`
            );

            await sut.handler.process(tableDef);
        });

        /**
         *
         */
        it('reset', async () => {
            const tableDef = MarkdownTableReader.convert(
                `|action                |value                  |
                 |----------------------|-----------------------|
                 |data:config#b.c.d     | e                     |
                 |transform:jsonLogic   | {"var": "b"}          |
                 |expected::transformed | {"c":{"d":"e"}}       |
                 |transform:reset       |                       |
                 |expected::transformed | {"b":{"c":{"d":"e"}}} |`
            );

            await sut.handler.process(tableDef);
        });
    });
});
