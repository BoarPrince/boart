import { TableRowType } from '../table/TableRowType';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { ConfigurationChecker } from './ConfigurationChecker';
import { ExecutionType } from './schema/ExecutionType';
import { RuntimeStartUp } from './schema/RuntimeStartUp';
import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';

/**
 *
 */
const defaultConfig: TestExecutionUnitConfig = {
    name: '-name-',
    context: {
        config: {
            conf: '-conf-'
        },
        pre: {},
        execution: {
            data: {},
            transformed: {},
            header: {}
        }
    },
    groupRowDef: ['group-1', 'group-2'],
    groupValidatorDef: [
        {
            name: '-group-name-',
            parameter: {}
        }
    ],
    rowDef: [
        {
            action: '-key-',
            executionType: ExecutionType.PropertySetter,
            executionOrder: TableRowType.Configuration,
            contextProperty: 'conf',
            parameterType: ParaType.True,
            selectorType: SelectorType.False,
            validatorDef: [
                {
                    name: '-name-',
                    parameter: {}
                }
            ],
            defaultValue: '-default-'
        },
        {
            action: '-key-2-',
            executionType: ExecutionType.PropertySetter,
            executionOrder: TableRowType.Configuration,
            contextProperty: 'conf',
            parameterType: ParaType.True,
            selectorType: SelectorType.False,
            runtime: {
                type: 'direct',
                startup: RuntimeStartUp.EACH,
                configuration: {}
            },
            validatorDef: [
                {
                    name: '-name-',
                    parameter: {}
                }
            ],
            defaultValue: '-default-'
        }
    ],
    runtime: {
        type: 'fork',
        startup: RuntimeStartUp.EACH,
        configuration: {}
    }
};

/**
 *
 */
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('../execution-proxy/ExecutionProxyFactoryHandler', () => ({
    ExecutionProxyFactoryHandler: class {
        static instance = {
            keys: () => ['grpc', 'fork']
        };
    }
}));

/**
 *
 */
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('../table/GroupRowDefinition', () => ({
    GroupRowDefinition: class {
        static keys = () => ['group-1', 'group-2'];
    }
}));

/**
 *
 */
let config: TestExecutionUnitConfig;
beforeEach(() => {
    config = JSON.parse(JSON.stringify(defaultConfig)) as TestExecutionUnitConfig;
});

/**
 *
 */
describe('wrong root', () => {
    /**
     *
     */
    test('missing name', () => {
        delete config.name;

        expect(() => ConfigurationChecker.check(config)).toThrow(
            `path: $\nmust contain property 'name', but only contains 'context, groupRowDef, groupValidatorDef, rowDef, runtime'`
        );
    });

    /**
     *
     */
    test('missing runtime', () => {
        const config = {
            name: '-name-',
            noRuntime: {}
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        expect(() => ConfigurationChecker.check(config as any)).toThrow(
            `must contain property 'runtime', but only contains 'name, noRuntime'`
        );
    });

    /**
     *
     */
    test('missing runtime - type', () => {
        delete config.runtime.type;

        expect(() => ConfigurationChecker.check(config)).toThrow(
            `path: $.runtime\nmust contain property 'type', but only contains 'startup, configuration'`
        );
    });

    /**
     *
     */
    test('wrong runtime - type', () => {
        config.runtime.type = 'grp';

        expect(() => ConfigurationChecker.check(config)).toThrow(
            `path: $.runtime.type\nvalue 'grp' is not allowd for property 'type'. Available:\n - 'grpc',\n - 'fork'`
        );
    });

    /**
     *
     */
    test('wrong rowDef - contextType', () => {
        config.rowDef[1].executionOrder = 'conf' as TableRowType;

        expect(() => ConfigurationChecker.check(config)).toThrow(
            `path: $.rowDef.1.executionOrder\nvalue 'conf' is not allowd for property 'executionOrder'. Available:\n - 'config',\n - 'pre'`
        );
    });

    /**
     *
     */
    test('missing executionType', () => {
        delete config.rowDef[0].executionType;

        expect(() => ConfigurationChecker.check(config)).toThrow(
            `path: $.rowDef.[0]\nmust contain property 'executionType', but only contains 'action, executionOrder, contextProperty, parameterType, selectorType, validatorDef, defaultValue'`
        );
    });
});

/**
 *
 */
describe('property setter', () => {
    /**
     *
     */
    test('default', () => {
        expect(() => ConfigurationChecker.checkPropertySetter(config.rowDef[0], '$.rowDef[5]')).not.toThrow();
    });

    /**
     *
     */
    test('default execution order', () => {
        config.rowDef[0].executionOrder = undefined;

        ConfigurationChecker.checkPropertySetter(config.rowDef[0], '$.rowDef[5]');
        expect(config.rowDef[0].executionOrder).toBe(TableRowType.Configuration);
    });
});

/**
 *
 */
describe('execution unit', () => {
    /**
     *
     */
    test('default', () => {
        delete config.rowDef[0].contextProperty;
        delete config.rowDef[0].defaultValue;
        config.rowDef[0].executionType = ExecutionType.ExecutionUnit;

        expect(() => ConfigurationChecker.checkExecutionUnit(config.rowDef[0], '$.rowDef[5]')).not.toThrow();
    });

    /**
     *
     */
    test('default execution order', () => {
        delete config.rowDef[0].contextProperty;
        delete config.rowDef[0].defaultValue;
        config.rowDef[0].executionType = ExecutionType.ExecutionUnit;
        config.rowDef[0].executionOrder = undefined;

        ConfigurationChecker.checkExecutionUnit(config.rowDef[0], '$.rowDef[5]');

        expect(config.rowDef[0].executionOrder).toBe(TableRowType.PreProcessing);
    });

    /**
     *
     */
    test('default parameter type', () => {
        delete config.rowDef[0].contextProperty;
        delete config.rowDef[0].defaultValue;
        config.rowDef[0].executionType = ExecutionType.ExecutionUnit;
        config.rowDef[0].parameterType = undefined;

        ConfigurationChecker.checkExecutionUnit(config.rowDef[0], '$.rowDef[5]');

        expect(config.rowDef[0].parameterType).toBe(ParaType.Optional);
    });

    /**
     *
     */
    test('default selector type', () => {
        delete config.rowDef[0].contextProperty;
        delete config.rowDef[0].defaultValue;
        config.rowDef[0].executionType = ExecutionType.ExecutionUnit;
        config.rowDef[0].selectorType = undefined;

        ConfigurationChecker.checkExecutionUnit(config.rowDef[0], '$.rowDef[5]');

        expect(config.rowDef[0].selectorType).toBe(SelectorType.Optional);
    });

    /**
     *
     */
    test('default selector validator definitions', () => {
        delete config.rowDef[0].contextProperty;
        delete config.rowDef[0].defaultValue;
        config.rowDef[0].executionType = ExecutionType.ExecutionUnit;
        config.rowDef[0].validatorDef = undefined;

        ConfigurationChecker.checkExecutionUnit(config.rowDef[0], '$.rowDef[5]');

        expect(config.rowDef[0].validatorDef).toStrictEqual([]);
    });
});

/**
 *
 */
describe('correct config', () => {
    /**
     *
     */
    test('ok', () => {
        expect(() => ConfigurationChecker.check(defaultConfig)).not.toThrow();
    });
});
