import { RuntimeStartUp, ExecutionType, PluginExecutionUnitConfig, MarkdownTableReader, ConfigurationParser, Runtime } from '@boart/core';
import ui_initialize from '@boart/ui';
import ui_selenium_initialize from '..';

/**
 *
 */
const executionConfig = {
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
    groupRowDef: [
        // 'basic-group-definition', 'basic-data'
    ],
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

/**
 *
 */
describe('client-plugin', () => {
    /**
     *
     */
    beforeEach(() => {
        ui_initialize();
        ui_selenium_initialize();
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(context.execution.data['info']['test-id'].value).toBe('xxx-value');
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
             | value:id  | test-id  | xxx-value |
             | info      | test-id  |           |`
        );

        const sut = new ConfigurationParser();
        const handler = sut.parseDefinition(executionConfig).handler;
        await handler.process(tableDef);

        const context = handler.getExecutionEngine().context;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(context.execution.data['info']['test-id'].value).toBe('xxx-value');
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(context.execution.data['info']['foo'].value).toBe('xxx-value');
    });
});
