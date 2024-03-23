import { ExecutionUnitPlugin, ExecutionUnitPluginHandler } from '..';

/**
 *
 */
class ExecutionUnitPluginMock implements ExecutionUnitPlugin {
    /**
     *
     */
    constructor(public action: string) {}

    /**
     *
     */
    execute = jest.fn();
}

/**
 *
 */
describe('plugin', () => {
    /**
     *
     */
    test('default', async () => {
        const sut = new ExecutionUnitPluginHandler();
        const pluginMock = new ExecutionUnitPluginMock('-mock-');
        const request = {
            context: null,
            value: null,
            additionalValue: null,
            action: { name: '-mock-', ast: null }
        };

        sut.addExecutionUnit('-mock-', () => pluginMock);

        await sut.execute(request);

        expect(pluginMock.execute).toHaveBeenCalledTimes(1);
        expect(pluginMock.execute).toHaveBeenCalledWith(request);
    });

    /**
     *
     */
    test('no plugin exists', async () => {
        const sut = new ExecutionUnitPluginHandler();
        const request = {
            context: null,
            value: null,
            additionalValue: null,
            action: { name: '-mock-', ast: null }
        };

        await expect(async () => await sut.execute(request)).rejects.toThrow(`plugin '-mock-' not found`);
    });

    /**
     *
     */
    test('plugin must be unique', () => {
        const sut = new ExecutionUnitPluginHandler();

        sut.addExecutionUnit('-mock-', null);

        expect(() => sut.addExecutionUnit('-mock-', null)).toThrow(`client action '-mock-' already exists`);
    });
});

/**
 *
 */
describe('main unit', () => {
    /**
     *
     */
    test('use main unit', async () => {
        const sut = new ExecutionUnitPluginHandler();
        const pluginMock = new ExecutionUnitPluginMock('-mock-');
        const request = {
            context: null,
            value: null,
            additionalValue: null,
            action: { name: null, ast: null }
        };

        sut.setMainExecutionUnit(() => pluginMock);

        await sut.execute(request);

        expect(pluginMock.execute).toHaveBeenCalledTimes(1);
        expect(pluginMock.execute).toHaveBeenCalledWith(request);
    });

    /**
     *
     */
    test('main unit can only be defined once', () => {
        const sut = new ExecutionUnitPluginHandler();
        sut.setMainExecutionUnit(() => null);

        expect(() => sut.setMainExecutionUnit(() => null)).toThrow('main execution unit is already defined');
    });
});
