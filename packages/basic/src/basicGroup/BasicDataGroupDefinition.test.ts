import 'jest-extended';

import {
    ExecutionContext,
    MarkdownTableReader,
    ObjectContent,
    ParaType,
    RowDefinition,
    TableHandler,
    TableHandlerBaseImpl,
    TableRowType,
    TextContent
} from '@boart/core';
import { DataExecutionContext, PropertySetterExecutionUnit, RowTypeValue } from '@boart/core-impl';

import BasicGroupDefinition from './BasicDataGroupDefinition';

/**
 *
 */
export type MockContext = ExecutionContext<
    {
        confValue: string;
    },
    {
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
            preValue: ''
        },
        execution: {
            data: null,
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
                parameterType: ParaType.False,
                executionUnit: new PropertySetterExecutionUnit<MockContext, RowTypeValue<MockContext>>('execution', 'data'),
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
describe('check expected:data', () => {
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
    it('expected:data can check complete value - incorrect', async () => {
        sut.handler.executionEngine.context.execution.data = new TextContent('xxx');

        const tableDef = MarkdownTableReader.convert(
            `|action       |value  |
             |-------------|-------|
             |expected:data|x-x-x  |`
        );

        await expect(async () => {
            await sut.handler.process(tableDef);
        }).rejects.toThrowError(`expected:data:
            expected: x-x-x
            actual: xxx`);
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
        }).rejects.toThrowError(`expected:data:
            expected: xyz
            actual: xy`);
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
        }).rejects.toThrowError(`expected:data:
            expected: xyz
            actual: {"a":"xyz"}`);
    });
});
