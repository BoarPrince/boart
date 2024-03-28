import { RuntimeStartUp, ExecutionType, PluginExecutionUnitConfig, MarkdownTableReader, ConfigurationParser, Runtime } from '@boart/core';
import ui_selenium_initialize from '..';
import ui_initialize from '@boart/ui';
import core_impl_initialize from '@boart/core-impl';

/**
 *
 */
let executionConfig: PluginExecutionUnitConfig;

/**
 *
 */
describe('client-plugin', () => {
    /**
     *
     */
    beforeAll(() => {
        ui_initialize();
        ui_selenium_initialize();
        core_impl_initialize();
    });

    /**
     *
     */
    beforeEach(() => {
        /**
         *
         */
        executionConfig = {
            name: 'UI call',
            context: {
                config: {},
                pre: {},
                execution: {
                    data: { info: {} },
                    transformed: {},
                    header: {}
                }
            },
            groupRowDef: ['basic-group-definition', 'basic-data'],
            groupValidatorDef: [
                // {
                //     name: 'group-val',
                //     parameter: ['para-1', 'para-2']
                // }
            ],
            rowDef: [
                {
                    action: 'value',
                    executionType: ExecutionType.ExecutionUnit,
                    runtime: {
                        type: 'local',
                        startup: RuntimeStartUp.ONCE,
                        configuration: {
                            collectorName: 'ui-call'
                        }
                    }
                },
                {
                    action: 'info',
                    executionType: ExecutionType.ExecutionUnit,
                    runtime: {
                        type: 'local',
                        startup: RuntimeStartUp.ONCE,
                        configuration: {
                            collectorName: 'ui-call'
                        }
                    }
                },
                {
                    action: 'page:open',
                    executionType: ExecutionType.ExecutionUnit,
                    runtime: {
                        type: 'local',
                        startup: RuntimeStartUp.ONCE,
                        configuration: {
                            collectorName: 'ui-call'
                        }
                    }
                },
                {
                    action: 'page:html',
                    executionType: ExecutionType.ExecutionUnit,
                    runtime: {
                        type: 'local',
                        startup: RuntimeStartUp.ONCE,
                        configuration: {
                            collectorName: 'ui-call'
                        }
                    }
                }
            ],
            runtime: {
                type: 'local',
                startup: RuntimeStartUp.ONCE,
                configuration: {
                    collectorName: 'ui-call'
                }
            }
        } as PluginExecutionUnitConfig;
    });

    /**
     *
     */
    afterEach(() => {
        Runtime.instance.runtime.notifyEnd(null);
    });

    /**
     *
     */
    describe('basic', () => {
        /**
         *
         */
        test('set value using id locator', async () => {
            const html = '<input id="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action    | location | value     |
                 |-----------|----------|-----------|
                 | page:html |          | ${html}   |
                 | value:id  | test-id  | xxx-value |
                 | info      | test-id  |           |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;
            await handler.process(tableDef);

            const context = handler.getExecutionEngine().context;

            expect(context.execution.data).toHaveProperty('info.test-id.value', 'xxx-value');
        });

        /**
         *
         */
        test('set value without specific locator', async () => {
            const html = '<input id="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action    | location | value     |
                 |-----------|----------|-----------|
                 | page:html |          | ${html}   |
                 | value     | test-id  | xxx-value |
                 | info      | test-id  |           |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;
            await handler.process(tableDef);

            const context = handler.getExecutionEngine().context;

            expect(context.execution.data).toHaveProperty('info.test-id.value', 'xxx-value');
        });

        /**
         *
         */
        test('set value with selector defintion locator', async () => {
            const html = '<input id="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action        | location | value     |
                 |---------------|----------|-----------|
                 | page:html     |          | ${html}   |
                 | value#test-id |          | xxx-value |
                 | info#test-id  |          |           |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;
            await handler.process(tableDef);

            const context = handler.getExecutionEngine().context;

            expect(context.execution.data).toHaveProperty('info.test-id.value', 'xxx-value');
        });

        /**
         *
         */
        test('use another location id for info', async () => {
            const html = '<input id="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action    | location | value     |
                 |-----------|----------|-----------|
                 | page:html |          | ${html}   |
                 | value     | test-id  | xxx-value |
                 | info      | test-id  | foo       |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;
            await handler.process(tableDef);

            const context = handler.getExecutionEngine().context;

            expect(context.execution.data).toHaveProperty('info.foo.value', 'xxx-value');
        });

        /**
         *
         */
        test('find value by name', async () => {
            const html = '<input name="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action     | location | value     |
                 |------------|----------|-----------|
                 | page:html  |          | ${html}   |
                 | value:name | test-id  | xxx-value |
                 | info:name  | test-id  |           |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;
            await handler.process(tableDef);

            const context = handler.getExecutionEngine().context;
            expect(context.execution.data).toHaveProperty('info.test-id.value', 'xxx-value');
        });
    });

    /**
     *
     */
    describe('error', () => {
        /**
         *
         */
        test('search id is wrong', async () => {
            const html = '<input id="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action     | location      | value     |
                 |------------|---------------|-----------|
                 | page:html  |               | ${html}   |
                 | value      | test-id-wrong | xxx-value |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;

            await expect(handler.process(tableDef)).rejects.toThrow(
                `element for action 'value' not found!\nelement with location: 'test-id-wrong' not found!`
            );
        });
    });

    /**
     *
     */
    describe('group - expected', () => {
        /**
         *
         */
        test('value must be expected', async () => {
            const html = '<input id="test-id" value="input-value"/>';

            const tableDef = MarkdownTableReader.convert(
                `| action                      | location | value      |
                 |-----------------------------|----------|------------|
                 | page:html                   |          | ${html}    |
                 | value                       | test-id  | xxx-value  |
                 | info                        | test-id  |            |
                 | expected#info.test-id.value |          |  xxx-value |`
            );

            const sut = new ConfigurationParser();
            const handler = sut.parseDefinition(executionConfig).handler;

            await expect(handler.process(tableDef)).resolves.not.toThrow();
        });
    });
});
