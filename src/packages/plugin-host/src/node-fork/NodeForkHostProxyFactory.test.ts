import { ExecutionUnitPluginFactoryHandler, RuntimeStartUp } from '@boart/core';
import { NodeForkHostProxyFactory } from './NodeForkHostProxyFactory';

import { NodeForkHost } from './NodeForkHost';
import plugin_initialize from '..';

/**
 *
 */
jest.mock('./NodeForkHost');

/**
 *
 */
describe('factory', () => {
    /**
     *
     */
    test('configuration must contain path', () => {
        const sut = new NodeForkHostProxyFactory();

        const config = {
            path: '-path-'
        };

        sut.init('-name-', config, RuntimeStartUp.ONCE);

        expect(() => sut.validate()).not.toThrow();
    });

    /**
     *
     */
    test('configuration must contain path - failed', () => {
        const sut = new NodeForkHostProxyFactory();

        const config = {
            pat: '-path-'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        sut.init('-name-', config, RuntimeStartUp.ONCE);

        expect(() => sut.validate()).toThrow(`path: $\nmust contain property 'path', but only contains 'pat'`);
    });

    /**
     *
     */
    test('startup can be null', () => {
        const sut = new NodeForkHostProxyFactory();

        const config = {
            path: '-path-'
        };

        sut.init('-name-', config, null);

        expect(() => sut.validate()).not.toThrow();
    });

    /**
     *
     */
    test('start must be called before an execution unit can be created', async () => {
        const sut = new NodeForkHostProxyFactory();

        const config = {
            path: '-path-'
        };

        sut.init('-name-', config, null);
        await sut.start();

        expect(sut.createExecutionUnit()).toBeInstanceOf(NodeForkHost);
    });

    /**
     *
     */
    test('startup can be null or once - but nothing else', () => {
        const sut = new NodeForkHostProxyFactory();

        const config = {
            path: '-path-'
        };

        sut.init('-name-', config, RuntimeStartUp.EACH);

        expect(() => sut.validate()).toThrow(`node fork allows only runtime startup 'once'`);
    });

    /**
     *
     */
    test('server must be called when start', async () => {
        const sut = new NodeForkHostProxyFactory();

        sut.init(
            '-name-',
            {
                path: '-path-'
            },
            null
        );
        await sut.start();

        expect(NodeForkHost).toHaveBeenCalledTimes(1);
        expect(NodeForkHost).toHaveBeenCalledWith('-name-', '-path-');
    });

    /**
     *
     */
    test('execution unit must be provided', () => {
        const sut = new NodeForkHostProxyFactory();

        sut.init(
            '-name-',
            {
                path: '-path-'
            },
            null
        );

        expect(() => sut.createExecutionUnit()).toThrow(`node fork must be started before creating an execution unit`);
    });
});

/**
 *
 */
describe('index', () => {
    /**
     *
     */
    beforeEach(() => {
        ExecutionUnitPluginFactoryHandler.instance.clear();
    });

    /**
     *
     */
    test('first init call', () => {
        plugin_initialize();
        expect(ExecutionUnitPluginFactoryHandler.instance.keys().length).toBeGreaterThan(0);
    });

    /**
     *
     */
    test('second init call', () => {
        plugin_initialize();
        const length = ExecutionUnitPluginFactoryHandler.instance.keys().length;

        plugin_initialize();
        expect(ExecutionUnitPluginFactoryHandler.instance.keys()).toHaveLength(length);
    });
});
