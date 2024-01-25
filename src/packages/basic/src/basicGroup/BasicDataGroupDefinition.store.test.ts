import 'jest-extended';

import {
    EnvLoader,
    GeneratorHandler,
    MarkdownTableReader,
    NativeContent,
    NullContent,
    ObjectContent,
    Runtime,
    RuntimeStatus,
    StepContext,
    Store,
    TableHandler,
    TableHandlerBaseImpl,
    TextContent,
    VariableParser
} from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';
import BasicDataGroupDefinition from './BasicDataGroupDefinition';
import BasicGroupDefinition from './BasicGroupDefinition';
import { basicInitialize } from '..';

/**
 *
 */
const variableParser = new VariableParser();
const astVar = variableParser.parseAction('store:var');
const astA = variableParser.parseAction('store:a');
const astB = variableParser.parseAction('store:b');

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
            static getSettings = jest.fn().mockReturnValue({});
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
const intialContext = {
    data: null,
    header: null,
    transformed: null
};

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
        key: Symbol('mock handler'),
        description: () => ({
            id: '8986d2f2-0681-4ca3-bef4-8c7313c53b54',
            description: null,
            examples: null
        }),
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
            data: intialContext.data,
            transformed: intialContext.transformed,
            header: intialContext.header
        }
    });

    /**
     *
     */
    protected addGroupRowDefinition(tableHandler: TableHandler<DataContext, RowTypeValue<DataContext>>) {
        tableHandler.addGroupRowDefinition(BasicDataGroupDefinition);
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
beforeAll(() => {
    basicInitialize();
});

/**
 *
 */
beforeEach(() => {
    Store.instance.testStore.clear();
    Store.instance.stepStore.clear();
    Store.instance.globalStore.clear();

    intialContext.data = null;
    intialContext.header = null;
    intialContext.transformed = null;
});

/**
 *
 */
describe('out store', () => {
    /**
     *
     */
    it('not initialized', async () => {
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

        expect(store.get(astVar).constructor.name).toBe('NullContent');
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
        }).rejects.toThrow('store:name is missing');
    });

    /**
     *
     */
    it('get deep value, first level', async () => {
        intialContext.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });

        const tableDef = MarkdownTableReader.convert(
            `|action  |value |
             |--------|------|
             |store#a | var  |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result).toBeInstanceOf(NativeContent);
        expect(result.toString()).toBe('1');
    });

    /**
     *
     */
    it('get deep value, first level, set and get', async () => {
        intialContext.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value  |
             |--------|-------|
             |store#a | var#e |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":1}');
    });

    /**
     *
     */
    it('get deep value, first level, set and get, multiple times - 2', async () => {
        intialContext.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value  |
             |--------|-------|
             |store#a | var#e |
             |store#b | var#f |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":1,"f":2}');
    });

    /**
     *
     */
    it('get deep value, first level, set and get, multiple times - 3', async () => {
        intialContext.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value  |
             |--------|-------|
             |store#a | var#e |
             |store#b | var#f |
             |store#c | var#g |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":1,"f":2,"g":3}');
    });

    /**
     *
     */
    it('get deep value, second level, set, multiple times - 3', async () => {
        intialContext.data = new ObjectContent({ a: 1, b: 2, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action  |value    |
             |--------|---------|
             |store#a | var#e.h |
             |store#b | var#f   |
             |store#c | var#g   |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.constructor.name).toBe('ObjectContent');
        expect(result.toString()).toBe('{"e":{"h":1},"f":2,"g":3}');
    });

    /**
     *
     */
    it('get deep value, second level, set and get, multiple times - 3', async () => {
        intialContext.data = new ObjectContent({ a: 1, b: { e: 5 }, c: 3, d: 4 });
        const tableDef = MarkdownTableReader.convert(
            `|action    |value    |
             |----------|---------|
             |store#a   | var#e.h |
             |store#b.e | var#f.u |
             |store#c   | var#g   |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
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
    it('set only the payload', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action   | value    |
             |---------|----------|
             |payload  | {"a": 1} |`
        );

        await sut.handler.process(tableDef);

        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);
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

        const context = sut.handler.getExecutionEngine().context;
        const result = context.preExecution.payload;
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

        const result = sut.handler.getExecutionEngine().context.preExecution.payload;
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

        const result = sut.handler.getExecutionEngine().context.preExecution.payload;
        expect(result?.constructor.name).toBe('ObjectContent');
        expect(result?.toString()).toBe('{"a":"1"}');
    });

    /**
     *
     */
    it('simple', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action         | value    |
             |---------------|----------|
             |payload        | {"a": 1} |
             |store::payload | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

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
        const result = Store.instance.testStore.get(astVar);

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
        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);

        const result = Store.instance.testStore.get(astVar);
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
        expect(sut.handler.getExecutionEngine().context.preExecution.payload).toBeInstanceOf(ObjectContent);

        const result = Store.instance.testStore.get(astVar);
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
        const result = Store.instance.testStore.get(astVar);

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
        const result = Store.instance.testStore.get(astVar);

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
        const result = Store.instance.testStore.get(astVar) as string;

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
        const result = Store.instance.testStore.get(astVar);

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

        const payload = sut.handler.getExecutionEngine().context.preExecution.payload;
        expect(payload).toBeInstanceOf(NativeContent);
        expect(payload.getValue()).toBeUndefined();

        const result = Store.instance.testStore.get(astVar) as NativeContent;
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

        const payload = sut.handler.getExecutionEngine().context.preExecution.payload;
        expect(payload).toBeInstanceOf(TextContent);
        expect(payload?.getValue()).toBe('undefined');

        const result = Store.instance.testStore.get(astVar) as TextContent;
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

        const result = Store.instance.testStore.get(astVar) as NativeContent;
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
        const result = Store.instance.testStore.get(astVar) as NullContent;

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
        const result = Store.instance.testStore.get(astVar) as TextContent;

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
        const result = Store.instance.testStore.get(astVar) as NativeContent;

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
        const result = Store.instance.testStore.get(astVar) as TextContent;

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
        const result = Store.instance.testStore.get(astVar);

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
        const result = Store.instance.testStore.get(astVar) as TextContent;

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
        const result = Store.instance.testStore.get(astVar);

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
        const result = Store.instance.testStore.get(astVar);

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
        const result = Store.instance.testStore.get(astVar);

        expect(result.toString()).toBe('{"a":1,"b":true}');
    });

    /**
     *
     */
    it('add number as string to additional property - 1', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | "2"      |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.toString()).toBe('{"a":1,"b":"2"}');
    });

    /**
     *
     */
    it('add boolean to additional property - 2', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value    |
             |----------|----------|
             |payload   | {"a": 1} |
             |payload#b | "true"   |
             |store     | var      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.toString()).toBe('{"a":1,"b":"true"}');
    });

    /**
     *
     */
    it('add to payload from store', async () => {
        Store.instance.testStore.put(astA, 1);

        const tableDef = MarkdownTableReader.convert(
            `|action    | value       |
             |----------|-------------|
             |payload   | \${store:a} |
             |store     | var         |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.toString()).toBe('1');
    });

    /**
     *
     */
    it('add to payload from store multiple times', async () => {
        Store.instance.testStore.put(astA, 1);
        Store.instance.testStore.put(astB, 2);

        const tableDef = MarkdownTableReader.convert(
            `|action    | value                   |
             |----------|-------------------------|
             |payload   | \${store:a}-\${store:b} |
             |store     | var                     |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

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

        await expect(() => sut.handler.process(tableDef)).rejects.toThrow('replacer "sore" does not exist');
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
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default, but store is defined', async () => {
        Store.instance.testStore.put(astA, 1);
        const tableDef = MarkdownTableReader.convert(
            `|action    | value          |
             |----------|----------------|
             |payload#a | \${store:a:-2} |
             |store     | var            |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default - with property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a#p:-1} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default - with property, but store is defined', async () => {
        Store.instance.testStore.put(astA, { p: 1 });
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a#p:-2} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 1 });
    });

    /**
     *
     */
    it('use store default - with undefined', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                  |
             |----------|------------------------|
             |payload#a   | \${store:a:-undefined} |
             |payload#b   | 2 |
             |store     | var                    |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: undefined, b: 2 });
    });

    /**
     *
     */
    it('use store default - with undefined in string', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                    |
             |----------|--------------------------|
             |payload#a | "\${store:a:-undefined}" |
             |payload#b | 2                        |
             |store     | var                      |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 'undefined', b: 2 });
    });

    /**
     *
     */
    it('use store default-assignment - with property', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload   | \${store:a#p:=1} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toBe(1);
        expect(Store.instance.testStore.get(astA)).toBeDefined();
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: 1 });
    });

    /**
     *
     */
    it('use store default-assignment - with two properties', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      | value                             |
             |------------|-----------------------------------|
             |payload#c.e | 3                                 |
             |payload#c.f | 4                                 |
             |payload#b   | \${store:a#c:=1} \${store:a#d:=1} |
             |store       | var                               |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({
            b: '1 1',
            c: {
                e: 3,
                f: 4
            }
        });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ c: 1, d: 1 });
    });

    /**
     *
     */
    it('use store default-assignment - with property, but store is defined', async () => {
        Store.instance.testStore.put(astA, { p: 1 });
        const tableDef = MarkdownTableReader.convert(
            `|action    | value            |
             |----------|------------------|
             |payload#a | \${store:a#p:=2} |
             |store     | var              |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 1 });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: 1 });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - simple data - number', async () => {
        Store.instance.testStore.put(astB, 3);
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                      |
             |----------|----------------------------|
             |payload#a | \${store:a#p:=\${store:b}} |
             |store     | var                        |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: 3 });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: 3 });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - simple data - string', async () => {
        Store.instance.testStore.put(astB, '-3-');
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                      |
             |----------|----------------------------|
             |payload#a | \${store:a#p:=\${store:b}} |
             |store     | var                        |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: '-3-' });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: '-3-' });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - object', async () => {
        Store.instance.testStore.put(astB, { p: 3 });
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                        |
             |----------|------------------------------|
             |payload#a | \${store:a#p:='\${store:b}'} |
             |store     | var                          |`
        );

        await sut.handler.process(tableDef);

        const resultVar = Store.instance.testStore.get(astVar);
        expect(resultVar.valueOf()).toStrictEqual({ a: { p: 3 } });

        const resultA = Store.instance.testStore.get(astA);
        expect(resultA.valueOf()).toStrictEqual({ p: { p: 3 } });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - array', async () => {
        Store.instance.testStore.put(astB, [1, 2]);
        const tableDef = MarkdownTableReader.convert(
            `|action    | value                        |
             |----------|------------------------------|
             |payload#a | \${store:a#p:="\${store:b}"} |
             |store     | var                          |`
        );

        await sut.handler.process(tableDef);
        const result = Store.instance.testStore.get(astVar);

        expect(result.valueOf()).toStrictEqual({ a: [1, 2] });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: [1, 2] });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - multiple assignment', async () => {
        jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

        const tableDef = MarkdownTableReader.convert(
            `|action  | value                                     |
             |--------|-------------------------------------------|
             |payload | {                                         |
             |        |  "a": "\${store:a:='\${generate:hex}'}",  |
             |        |  "b": "\${store:a}"                       |
             |        | }                                         |
             |store   | var                                       |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astA).valueOf()).toBe(8);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({
            a: '8',
            b: '8'
        });
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - multiple assignment - failure', async () => {
        jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

        const tableDef = MarkdownTableReader.convert(
            `|action  | value                                  |
             |--------|----------------------------------------|
             |payload | {                                      |
             |        |  "a": "\${store:a:=\${generate:hex}}", |
             |        |  "b": "\${store:b}"                    |
             |        | }                                      |
             |store   | var                                    |`
        );

        await expect(async () => sut.handler.process(tableDef)).rejects.toThrow(`can't find value of '\${store:b}'`);
    });

    /**
     *
     */
    it('use store default-assignment - recursive usage - multiple assignment - optional', async () => {
        jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

        const tableDef = MarkdownTableReader.convert(
            `|action  | value                                  |
             |--------|----------------------------------------|
             |payload | {                                      |
             |        |  "a": "\${store:a:=\${generate:hex}}", |
             |        |  "b": "\${store?:b}"                    |
             |        | }                                      |
             |store   | var                                    |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({
            a: '8',
            b: null
        });
    });

    /**
     *
     */
    it('using json comment with replacement', async () => {
        jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

        const tableDef = MarkdownTableReader.convert(
            `|action  | value                               |
             |--------|-------------------------------------|
             |payload | {                                   |
             |        |  // "\${store:a:=\${generate:hex}}" |
             |        |  "b": \${store:a}                   |
             |        | }                                   |
             |store   | var                                 |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astA).valueOf()).toBe(8);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({
            b: 8
        });
    });
});

/** */
describe('generate', () => {
    /**
     *
     */
    it('default', async () => {
        const hexGenerator = GeneratorHandler.instance.get('hex');
        jest.spyOn(hexGenerator, 'generate').mockImplementation((paras) => paras.join(':'));

        const tableDef = MarkdownTableReader.convert(
            `|action    | value              |
             |----------|--------------------|
             |payload#a | \${generate:hex:5} |
             |store     | var                |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({ a: 5 });
    });

    /**
     *
     */
    it('default with name', async () => {
        let hex = 1;
        const hexGenerator = GeneratorHandler.instance.get('hex');
        jest.spyOn(hexGenerator, 'generate').mockImplementation(() => (hex++).toString());

        const tableDef = MarkdownTableReader.convert(
            `|action    | value                   |
             |----------|-------------------------|
             |payload#a | \${generate:hex::nameA} |
             |payload#b | \${generate:hex::nameB} |
             |payload#c | \${generate:hex::nameA} |
             |store     | var                     |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({ a: 1, b: 2, c: 1 });
    });

    /**
     *
     */
    it('default with name and scope', async () => {
        let hex = 10;
        const hexGenerator = GeneratorHandler.instance.get('hex');
        jest.spyOn(hexGenerator, 'generate').mockImplementation(() => (hex++).toString());

        const tableDef = MarkdownTableReader.convert(
            `|action    | value                      |
             |----------|---------------------------|
             |payload#a | \${generate@g:hex::nameA} |
             |payload#b | \${generate@g:hex::nameB} |
             |payload#c | \${generate@g:hex::nameA} |
             |payload#d | \${generate:hex::nameA}   |
             |store     | var                       |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({ a: 10, b: 11, c: 10, d: 12 });
    });

    /**
     *
     */
    it('use with store assignment', async () => {
        const hexGenerator = GeneratorHandler.instance.get('hex');
        jest.spyOn(hexGenerator, 'generate').mockImplementation((paras) => paras.join(':'));

        const tableDef = MarkdownTableReader.convert(
            `|action    | value                               |
             |----------|-------------------------------------|
             |payload#a | \${store:a#p:=\${generate:hex:111}} |
             |store     | var                                 |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({ a: 111 });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: 111 });
    });

    /**
     *
     */
    it('use with store assignment and scoped name', async () => {
        const hexGenerator = GeneratorHandler.instance.get('hex');
        jest.spyOn(hexGenerator, 'generate').mockImplementation((paras) => paras.join(':'));

        const tableDef = MarkdownTableReader.convert(
            `|action    | value                                    |
             |----------|------------------------------------------|
             |payload#a | \${store:a#p:=\${generate:hex:22::name}} |
             |store     | var                                      |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toStrictEqual({ a: 22 });
        expect(Store.instance.testStore.get(astA).valueOf()).toStrictEqual({ p: 22 });
    });

    /**
     *
     */
    it('use template generator', async () => {
        delete globalThis._templateHandlerInstance;
        jest.spyOn(EnvLoader, 'getSettings').mockImplementation(() => ({
            template_mapping: {
                a: {
                    b: 'c'
                }
            }
        }));

        const tableDef = MarkdownTableReader.convert(
            `|action  | value                |
             |--------|----------------------|
             |payload | \${generate:tpl:a:b} |
             |store   | var                  |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toBe('c');
    });

    /**
     *
     */
    it('use template generator contains hex generator', async () => {
        const hexGenerator = GeneratorHandler.instance.get('hex');
        jest.spyOn(hexGenerator, 'generate').mockImplementation((paras) => paras.join(':'));

        delete globalThis._templateHandlerInstance;
        jest.spyOn(EnvLoader, 'getSettings').mockImplementation(() => ({
            template_mapping: {
                a: '${generate:hex:22}'
            }
        }));

        const tableDef = MarkdownTableReader.convert(
            `|action  | value              |
             |--------|--------------------|
             |payload | \${generate:tpl:a} |
             |store   | var                |`
        );

        await sut.handler.process(tableDef);

        const result = Store.instance.testStore.get(astVar);
        expect(result.valueOf()).toBe(22);
    });

    /**
     *
     */
    it('use template generator - but template not found', async () => {
        delete globalThis._templateHandlerInstance;
        jest.spyOn(EnvLoader, 'getSettings').mockImplementation(() => ({}));

        const tableDef = MarkdownTableReader.convert(
            `|action  | value              |
             |--------|--------------------|
             |payload | \${generate:tpl:a} |
             |store   | var                |`
        );

        await expect(async () => sut.handler.process(tableDef)).rejects.toThrow(`error template generator, template: 'a' does not exist`);
    });
});

/**
 *
 */
describe('check run:xxx', () => {
    /**
     *
     */
    beforeEach(() => {
        Store.instance.testStore.clear();
        Store.instance.stepStore.clear();
        Runtime.instance.stepRuntime.currentContext = new StepContext();
        Runtime.instance.stepRuntime.currentContext.status = RuntimeStatus.notExecuted;
    });

    /**
     *
     */
    it('run:only default', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value  |
             |------------|-------|
             |run:only:a  | a     |
             |payload     | x     |
             |store       | var   |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astVar).valueOf()).toBe('x');
    });

    /**
     *
     */
    it('run:only not-matching', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value  |
             |------------|-------|
             |run:only:a  | b     |
             |payload     | x     |
             |store       | var   |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astVar)).toBeNull();
    });

    /**
     *
     */
    it('run:only use context replacer', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value                |
             |------------|---------------------|
             |run:only:a  | a                   |
             |payload     | \${context:arg1:-z} |
             |store       | var                 |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astVar)?.valueOf()).toBe('z');
    });

    /**
     *
     */
    it('run:only use context replacer with arg', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value                |
             |------------|---------------------|
             |run:only:a  | a:y                 |
             |payload     | \${context:arg1:-z} |
             |store       | var                 |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astVar)?.valueOf()).toBe('y');
    });

    /**
     *
     */
    it('run:only use context replacer with named arg', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value                |
             |------------|---------------------|
             |run:only:a  | a:y@para            |
             |payload     | \${context:para}    |
             |store       | var                 |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astVar)?.valueOf()).toBe('y');
    });

    /**
     *
     */
    it('run:only use context replacer with default arg', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value                |
             |------------|---------------------|
             |run:only:a  | ::y@para::, a       |
             |payload     | \${context:para}    |
             |store       | var                 |`
        );

        await sut.handler.process(tableDef);
        expect(Store.instance.testStore.get(astVar)?.valueOf()).toBe('y');
    });

    /**
     *
     */
    it('run:only use context replacer but arg not defined', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value             |
             |------------|------------------|
             |run:only:a  | a                |
             |payload     | \${context:para} |
             |store       | var              |`
        );

        await expect(() => sut.handler.process(tableDef)).rejects.toThrow("context 'para' not defined");
    });

    /**
     *
     */
    it('run:only executes - validators must be executed', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value           |
             |------------|----------------|
             |run:only:a  | a              |
             |payload     | \${store:var1} |
             |store       | var            |`
        );

        await expect(() => sut.handler.process(tableDef)).rejects.toThrow("can't find value of '${store:var1}'");
    });

    /**
     *
     */
    it('run:only does not execute - validators must not be executed', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action      |value           |
             |------------|----------------|
             |run:only:a  | b              |
             |payload     | \${store:var1} |
             |store       | var            |`
        );

        // process runs without problems
        await sut.handler.process(tableDef);

        expect(Runtime.instance.stepRuntime.currentContext.status).toBe(RuntimeStatus.stopped);
    });

    /**
     *
     */
    it('run:not-empty does not execute when value is an empty string', async () => {
        const astVar1 = variableParser.parseAction('store:var1');
        Store.instance.testStore.put(astVar1, '');

        const tableDef = MarkdownTableReader.convert(
            `|action        |value           |
             |--------------|----------------|
             |run:not-empty | \${store:var1} |
             |payload       | a              |
             |store         | var            |`
        );

        await sut.handler.process(tableDef);

        expect(Runtime.instance.stepRuntime.currentContext.status).toBe(RuntimeStatus.stopped);
        expect(Store.instance.testStore.get(astVar)).toBeNull();
    });

    /**
     *
     */
    it('run:not-empty does not execute when value is null', async () => {
        const astVar1 = variableParser.parseAction('store:var1');
        Store.instance.testStore.put(astVar1, null);

        const tableDef = MarkdownTableReader.convert(
            `|action        |value           |
             |--------------|----------------|
             |run:not-empty | \${store:var1} |
             |payload       | a              |
             |store         | var            |`
        );

        await sut.handler.process(tableDef);

        expect(Runtime.instance.stepRuntime.currentContext.status).toBe(RuntimeStatus.stopped);
        expect(Store.instance.testStore.get(astVar)).toBeNull();
    });

    /**
     *
     */
    it('run:not-empty does not execute when store is not defined', async () => {
        const tableDef = MarkdownTableReader.convert(
            `|action        |value           |
             |--------------|----------------|
             |run:not-empty | \${store:var1} |
             |payload       | a              |
             |store         | var            |`
        );

        await expect(async () => await sut.handler.process(tableDef)).rejects.toThrow("can't find value of '${store:var1}'");
    });
});
