import { TableRowType } from '../table/TableRowType';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { ConfigurationChecker } from './ConfigurationChecker';
import { RuntimeEnv } from './schema/RuntimeEnv';
import { RuntimeStartUp } from './schema/RuntimeStartUp';
import { RuntimeType } from './schema/RuntimeType';
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
    rowDef: [
        {
            action: '-key-',
            contextType: TableRowType.Configuration,
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
            contextType: TableRowType.Configuration,
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
        }
    ],
    runtime: {
        type: RuntimeType.GRPC,
        env: RuntimeEnv.NATIVE,
        startup: RuntimeStartUp.EACH,
        configuration: {}
    }
};

/**
 *
 */
describe('wrong root', () => {
    /**
     *
     */
    test('missing name', () => {
        const config = JSON.parse(JSON.stringify(defaultConfig)) as TestExecutionUnitConfig;
        delete config.name;

        expect(() => ConfigurationChecker.checkJSONConfig(config)).toThrow(
            `must contain property 'name', but only contains 'context, groupRowDef, rowDef, runtime'`
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
        expect(() => ConfigurationChecker.checkJSONConfig(config as any)).toThrow(
            `must contain property 'runtime', but only contains 'name, noRuntime'`
        );
    });

    /**
     *
     */
    test('missing runtime - type', () => {
        const config = JSON.parse(JSON.stringify(defaultConfig)) as TestExecutionUnitConfig;
        delete config.runtime.type;

        expect(() => ConfigurationChecker.checkJSONConfig(config)).toThrow(
            `path: $.runtime\nmust contain property 'type', but only contains 'env, startup, configuration'`
        );
    });

    /**
     *
     */
    test('wrong runtime - type', () => {
        const config = JSON.parse(JSON.stringify(defaultConfig)) as TestExecutionUnitConfig;
        config.runtime.type = 'grp' as RuntimeType;

        expect(() => ConfigurationChecker.checkJSONConfig(config)).toThrow(
            `path: $.runtime.type\nvalue 'grp' is not allowd for property 'type'. Allowed values are => 'grpc,`
        );
    });

    /**
     *
     */
    test('wrong rowDef - contextType', () => {
        const config = JSON.parse(JSON.stringify(defaultConfig)) as TestExecutionUnitConfig;
        config.rowDef[1].contextType = 'conf' as TableRowType;

        expect(() => ConfigurationChecker.checkJSONConfig(config)).toThrow(
            `path: $.rowDef.1.contextType\nvalue 'conf' is not allowd for property 'contextType'. Allowed values are => 'config, pre'`
        );
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
        expect(() => ConfigurationChecker.checkJSONConfig(defaultConfig)).not.toThrow();
    });
});
