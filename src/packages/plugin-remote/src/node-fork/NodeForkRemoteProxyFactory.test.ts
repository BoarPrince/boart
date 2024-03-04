import { RuntimeStartUp } from '@boart/core';
import { NodeForkRemoteProxyFactory } from './NodeForkRemoteProxyFactory';

import { NodeForkExecutionProxyUnit } from './NodeForkExecutionProxyUnit';
import { NodeForkServer } from './NodeForkServer';

/**
 *
 */
jest.mock('./NodeForkServer');
jest.mock('./NodeForkExecutionProxyUnit');

/**
 *
 */
describe('factory', () => {
    /**
     *
     */
    test('configuration must contain path', () => {
        const sut = new NodeForkRemoteProxyFactory();

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
        const sut = new NodeForkRemoteProxyFactory();

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
        const sut = new NodeForkRemoteProxyFactory();

        const config = {
            path: '-path-'
        };

        sut.init('-name-', config, null);

        expect(() => sut.validate()).not.toThrow();
    });

    /**
     *
     */
    test('startup can be null or once - but nothing else', () => {
        const sut = new NodeForkRemoteProxyFactory();

        const config = {
            path: '-path-'
        };

        sut.init('-name-', config, RuntimeStartUp.EACH);

        expect(() => sut.validate()).toThrow(`node fork allows only runtime startup 'once'`);
    });

    /**
     *
     */
    test('server must be called when start', () => {
        const sut = new NodeForkRemoteProxyFactory();

        sut.init(
            '-name-',
            {
                path: '-path-'
            },
            null
        );
        sut.start();

        expect(NodeForkServer).toHaveBeenCalledTimes(1);
        expect(NodeForkServer).toHaveBeenCalledWith('-path-');
    });

    /**
     *
     */
    test('execution unit must be provided', () => {
        const sut = new NodeForkRemoteProxyFactory();

        sut.init(
            '-name-',
            {
                path: '-path-'
            },
            null
        );

        sut.createExecutionUnit();

        expect(NodeForkExecutionProxyUnit).toHaveBeenCalledTimes(1);
        expect(NodeForkExecutionProxyUnit).toHaveBeenCalledWith('-name-', undefined);
    });
});
