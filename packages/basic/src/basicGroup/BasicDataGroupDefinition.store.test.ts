import 'jest-extended';

import {
    MarkdownTableReader,
    NativeContent,
    NullContent,
    ObjectContent,
    TableHandler,
    TableHandlerBaseImpl,
    TextContent
} from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';
import { Store } from '@boart/core/src/store/Store';

import BasicGroupDefinition from './BasicDataGroupDefinition';

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
        tableHandler.addGroupRowDefinition(BasicGroupDefinition);
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
    it('null', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action  |value |
             |--------|------|
             |store   | var  |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get('var')).toBeInstanceOf(NullContent);
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
        expect(result.getValue()).toBe(1);
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
        expect(result).toBeInstanceOf(ObjectContent);
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
        expect(result).toBeInstanceOf(ObjectContent);
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
        expect(result).toBeInstanceOf(ObjectContent);
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
        expect(result).toBeInstanceOf(ObjectContent);
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
        expect(result).toBeInstanceOf(ObjectContent);
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
        expect(result).toBeInstanceOf(ObjectContent);
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
        expect(result).toBeInstanceOf(ObjectContent);
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

        expect(result).toBeInstanceOf(ObjectContent);
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
        const result = Store.instance.testStore.get('var');

        expect(result.getValue()).toMatchObject({ a: 1, b: ['b', 'c'] });
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
        expect(payload?.getValue()).toBeUndefined();

        const result = Store.instance.testStore.get('var');
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

        const result = Store.instance.testStore.get('var');
        expect(result).toBeInstanceOf(TextContent);
        expect(result?.getValue()).toBe('undefined');
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

        const result = Store.instance.testStore.get('var');
        expect(result?.getValue()).toBe('"undefined"');
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
        const result = Store.instance.testStore.get('var');

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
        const result = Store.instance.testStore.get('var');

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
        const result = Store.instance.testStore.get('var');

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
        const result = Store.instance.testStore.get('var');

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
        const result = Store.instance.testStore.get('var');

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
});