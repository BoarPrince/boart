import 'jest-extended';

import { BasicDataGroupDefinition } from '@boart/basic';
import {
    MarkdownTableReader,
    NativeContent,
    NullContent,
    ObjectContent,
    TableHandler,
    TableHandlerBaseImpl,
    TextContent
} from '@boart/core';
import { Store } from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    return {
        __esModule: true,
        ...originalModule,
        EnvLoader: class {
            static instance = {
                mapReportData: (filename: string) => filename,
                get: (key: string) => key
            };
        },
        TextLanguageHandler: class {
            static instance = {
                language: {
                    subscribe: () => null
                }
            };
        }
    };
});

/**
 *
 */
class MockTableHandler extends TableHandlerBaseImpl<DataContext, RowTypeValue<DataContext>> {
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
        config: {},
        preExecution: {
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
    protected addGroupRowDefinition(tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>) {
        tableHandler.addGroupRowDefinition(BasicDataGroupDefinition);
    }

    /*<*
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected addRowDefinition(_: TableHandler<DataContext, RowTypeValue<DataContext>>) {
        // nothing to define
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected addGroupValidation(_tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>) {
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
describe('out store', () => {
    /**
     *
     */
    beforeEach(() => {
        sut.handler.executionEngine.context.execution.data = new NullContent();
        sut.handler.executionEngine.context.execution.transformed = new NullContent();
        Store.instance.testStore.clear();
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
            `|action  |value |
             |--------|------|
             |store   | a    |`
        );

        await sut.handler.process(tableDef);
    });

    /**
     *
     */
    it('null handling', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action  |value |
             |--------|------|
             |store   | var  |`
        );

        await sut.handler.process(tableDef);
        const store = Store.instance.testStore;
        expect(store.get('var').constructor.name).toBe('NullContent');
    });

    /**
     *
     */
    it('error: name is missing', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action  |value |
             |--------|------|
             |store   |      |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError('store:name is missing');
    });

    /**
     *
     */
    it('get deep value, first level', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value |
             |--------|------|
             |store#a | var  |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');
        expect(result).toBeInstanceOf(NativeContent);
        expect(result.toString()).toBe('1');
    });

    /**
     *
     */
    it('get deep value, first level, set and get', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value  |
             |--------|-------|
             |store#a | var#e |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":1}');
    });

    /**
     *
     */
    it('get deep value, first level, set and get, multiple times - 2', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value  |
             |--------|-------|
             |store#a | var#e |
             |store#b | var#f |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get('var');
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":1,"f":2}');
    });

    /**
     *
     */
    it('get deep value, first level, set and get, multiple times - 3', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value  |
             |--------|-------|
             |store#a | var#e |
             |store#b | var#f |
             |store#c | var#g |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get('var');
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":1,"f":2,"g":3}');
    });

    /**
     *
     */
    it('get deep value, second level, set, multiple times - 3', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value    |
             |--------|---------|
             |store#a | var#e.h |
             |store#b | var#f   |
             |store#c | var#g   |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get('var');
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":{"h":1},"f":2,"g":3}');
    });

    /**
     *
     */
    it('get deep value, second level, set and get, multiple times - 3', async () => {
        sut.handler.executionEngine.context.execution.data = new ObjectContent({ a: 1, b: { e: 5 }, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action    |value    |
             |----------|---------|
             |store#a   | var#e.h |
             |store#b.e | var#f.u |
             |store#c   | var#g   |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get('var');
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":{"h":1},"f":{"u":5},"g":3}');
    });
});

/**
 *
 */
describe('out store from payload', () => {
    /**
     *
     */
    beforeEach(() => {
        sut.handler.executionEngine.context.execution.data = null;
        sut.handler.executionEngine.context.execution.transformed = null;
        sut.handler.executionEngine.context.preExecution.payload = null;
        Store.instance.testStore.clear();
    });

    /**
     *
     */
    it('set only the payload', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action   | value    |
             |---------|----------|
             |payload  | {"a": 1} |`
        );

        await sut.handler.process(tableDef);

        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);
    });

    /**
     *
     */
    it('set only the payload - number as string', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action  | value |
             |--------|-------|
             |payload | "2"   |`
        );

        await sut.handler.process(tableDef);

        const result = sut.handler.executionEngine.context.preExecution.payload;
        expect(result).toBeInstanceOf(TextContent);
        expect(result?.toString()).toBe('2');
    });

    /**
     *
     */
    it('set only the payload with selector - number as string', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value |
             |----------|-------|
             |payload#a | "2"   |`
        );

        await sut.handler.process(tableDef);

        const result = sut.handler.executionEngine.context.preExecution.payload;
        expect(result?.constructor.name).toBe('ObjectContent');
        expect(result?.getValue()).toBeInstanceOf(Object);

        expect((result as ObjectContent).get('a')).toBeString();
        expect((result as ObjectContent).get('a')?.toString()).toBe('2');

        expect(result?.toString()).toBe('{"a":"2"}');
    });

    /**
     *
     */
    it('set only the payload - object with number as string', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action  | value      |
             |--------|------------|
             |payload | {"a": "1"} |`
        );

        await sut.handler.process(tableDef);

        const result = sut.handler.executionEngine.context.preExecution.payload;
        expect(result?.constructor.name).toBe('ObjectContent');
        expect(result?.toString()).toBe('{"a":"1"}');
    });

    /**
     *
     */
    it('simple', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action        | value    |
             |--------------|----------|
             |payload       | {"a": 1} |
             |store:payload | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"a":1}');
    });

    /**
     *
     */
    it('add property without parameter', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | 2        |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":2}');
    });

    /**
     *
     */
    it('add empty array to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | []       |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);

        const result = Store.instance.testStore.get('var');
        expect(result.toString()).toBe('{"a":1,"b":[]}');
    });

    /**
     *
     */
    it('add empty array to additional property - array with spaces', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | [   ]    |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        expect(sut.handler.executionEngine.context.preExecution.payload).toBeInstanceOf(ObjectContent);

        const result = Store.instance.testStore.get('var');
        expect(result.toString()).toBe('{"a":1,"b":[]}');
    });

    /**
     *
     */
    it('add empty object to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | {}       |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":{}}');
    });

    /**
     *
     */
    it('add empty object to additional property - object with spaces', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | {   }    |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":{}}');
    });

    /**
     *
     */
    it('add array to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value      |
             |----------|------------|
             |payload   | {"a": 1}   |
             |payload#b | ["b", "c"] |
             |store     | var        |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var') as string;

        expect(JSON.parse(result)).toMatchObject({ a: 1, b: ['b', 'c'] });
        expect(result.toString()).toBe('{"a":1,"b":["b","c"]}');
    });

    /**
     *
     */
    it('add undefined to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value     |
             |----------|-----------|
             |payload   | {"a": 1}  |
             |payload#b | undefined |
             |store     | var       |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1}');
    });

    /**
     *
     */
    it('override property with undefined', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value     |
             |----------|-----------|
             |payload   | {"a": 1}  |
             |payload   | undefined |
             |store     | var       |`
        );

        await sut.handler.process(tableDef);

        const payload = sut.handler.executionEngine.context.preExecution.payload;
        expect(payload).toBeInstanceOf(NativeContent);
        expect(payload.getValue()).toBeUndefined();

        const result = Store.instance.testStore.get('var') as NativeContent;
        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBeUndefined();
    });

    /**
     *
     */
    it('override property with "undefined"', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value       |
             |----------|-------------|
             |payload   | {"a": 1}    |
             |payload   | "undefined" |
             |store     | var         |`
        );

        await sut.handler.process(tableDef);

        const payload = sut.handler.executionEngine.context.preExecution.payload;
        expect(payload).toBeInstanceOf(TextContent);
        expect(payload?.getValue()).toBe('undefined');

        const result = Store.instance.testStore.get('var') as TextContent;
        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('undefined');
    });

    /**
     *
     */
    it('override property with quoted undefined', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value         |
             |----------|---------------|
             |-payload   | {"a": 1}      |
             |payload   | ""undefined"" |
             |store     | var           |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get('var') as NativeContent;
        expect(result.getValue()).toBe('"undefined"');
    });

    /**
     *
     */
    it('override property with null', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value     |
             |----------|-----------|
             |payload   | {"a": 1}  |
             |payload   | null      |
             |store     | var       |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var') as NullContent;

        expect(result).toBeInstanceOf(NullContent);
        expect(result.getValue()).toBeNull();
    });

    /**
     *
     */
    it('override property with "null"', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value     |
             |----------|-----------|
             |payload   | {"a": 1}  |
             |payload   | "null"    |
             |store     | var       |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var') as TextContent;

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('null');
    });

    /**
     *
     */
    it('override property with 1', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload   | 1        |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var') as NativeContent;

        expect(result).toBeInstanceOf(NativeContent);
        expect(result.getValue()).toBe(1);
    });

    /**
     *
     */
    it('override property with "1"', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value     |
             |----------|-----------|
             |payload   | {"a": 1}  |
             |payload   | "1"    |
             |store     | var       |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var') as TextContent;

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('1');
    });

    /**
     *
     */
    it('override property with true', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload   | true     |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result).toBeInstanceOf(NativeContent);
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('override property with "true"', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value     |
             |----------|-----------|
             |payload   | {"a": 1}  |
             |payload   | "true"    |
             |store     | var       |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var') as TextContent;

        expect(result).toBeInstanceOf(TextContent);
        expect(result.getValue()).toBe('true');
    });

    /**
     *
     */
    it('add null to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | null     |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":null}');
    });

    /**
     *
     */
    it('add number to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | 2        |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":2}');
    });

    /**
     *
     */
    it('add boolean to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | true     |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":true}');
    });

    /**
     *
     */
    it('add number as string to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | "2"      |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":"2"}');
    });

    /**
     *
     */
    it('add boolean to additional property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | "true"   |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('{"a":1,"b":"true"}');
    });

    /**
     *
     */
    it('add to payload from store', async () => {
        Store.instance.testStore.put('a', 1);

        const tableDef = MarkdownTableReader.convert(
            `|action    | value       |
             |----------|-------------|
             |payload   | \${store:a} |
             |store     | var         |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('1');
    });

    /**
     *
     */
    it('add to payload from store multiple times', async () => {
        Store.instance.testStore.put('a', 1);
        Store.instance.testStore.put('b', 2);

        const tableDef = MarkdownTableReader.convert(
            `|action    | value                   |
             |----------|-------------------------|
             |payload   | \${store:a}-\${store:b} |
             |store     | var                     |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('1-2');
    });

    /**
     *
     */
    it('try to payload from wrong replacement', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value      |
             |----------|------------|
             |payload   | \${sore:a} |
             |store     | var        |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.toString()).toBe('${sore:a}');
    });

    /**
     *
     */
    it('use store default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value          |
             |----------|----------------|
             |payload#a | \${store:a:-1} |
             |store     | var            |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default, but store is defined', async () => {
        Store.instance.testStore.put('a', 1);
        const tableDef = MarkdownTableReader.convert(
            `|action    | value          |
             |----------|----------------|
             |payload#a | \${store:a:-2} |
             |store     | var            |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default - with property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a.p:-1} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default - with property, but store is defined', async () => {
        Store.instance.testStore.put('a', { p: 1 });
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a.p:-2} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default-assignment - with property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a.p:=1} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 1 });
        expect(Store.instance.testStore.get('a').valueOf()).toStrictEqual({ p: 1 });
    });

    /**
     *
     */
    it('use store default-assignment - with property, but store is defined', async () => {
        Store.instance.testStore.put('a', { p: 1 });
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a.p:=2} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 1 });
        expect(Store.instance.testStore.get('a').valueOf()).toStrictEqual({ p: 1 });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - simple data', async () => {
        Store.instance.testStore.put('b', 3);
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                      |
             |----------|----------------------------|
             |payload#a | \${store:a.p:=\${store:b}} |
             |store     | var                        |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: 3 });
        expect(Store.instance.testStore.get('a').valueOf()).toStrictEqual({ p: 3 });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - object', async () => {
        Store.instance.testStore.put('b', { p: 3 });
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                      |
             |----------|----------------------------|
             |payload#a | \${store:a.p:=\${store:b}} |
             |store     | var                        |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get('var');

        expect(result.valueOf()).toStrictEqual({ a: { p: 3 } });
        expect(Store.instance.testStore.get('a').valueOf()).toStrictEqual({ p: { p: 3 } });
    });
});
