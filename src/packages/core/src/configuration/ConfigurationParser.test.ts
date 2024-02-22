import * as fs from 'fs';
import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';
import { TableRowType } from '../table/TableRowType';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { RuntimeStartUp } from './schema/RuntimeStartUp';
import { ConfigurationParser } from './ConfigurationParser';
import { ValidatorFactoryManager } from '../validators/ValidatorFactoryManager';
import { ValidatorFactory } from '../validators/ValidatorFactory';
import { RowValidator } from '../validators/RowValidator';
import { ObjectValidator } from '../validators/object/ObjectValidator';
import { ExecutionProxyFactoryHandler } from '../execution-proxy/ExecutionProxyFactoryHandler';
import { ExecutionProxyFactory } from '../execution-proxy/ExecutionProxyFactory';
import { GroupRowDefinition } from '../table/GroupRowDefinition';
import { TableHandlerInstances } from '../table/TableHandlerInstances';
import { ValidatorType } from '../validators/ValidatorType';
import { MarkdownTableReader } from '../table/MarkdownTableReader';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { TextContent } from '../data/TextContent';
import { DirectExecutionProxyFactory } from './DirectExecutionProxyFactory';
import { ExecutionType } from './schema/ExecutionType';

/**
 *
 */
jest.mock('fs');

/**
 *
 */
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('./ConfigurationLookup', () => ({
    ConfigurationLookup: class {
        lookup = jest.fn().mockReturnValue(['extensions/text-extension/boart.json']);
    }
}));

/**
 *
 */
const defaultConfig = JSON.stringify({
    name: '-rest call-',
    context: {
        config: {
            conf: '-conf-',
            conf2: '-conf-'
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
            name: 'group-val',
            parameter: ['para-1', 'para-2']
        }
    ],
    rowDef: [
        {
            action: '-key-',
            executionOrder: TableRowType.Configuration,
            executionType: ExecutionType.PropertySetter,
            contextProperty: 'config.conf',
            parameterType: ParaType.True,
            selectorType: SelectorType.False,
            validatorDef: [
                {
                    name: 'validator-1',
                    parameter: ['para-1', 'para-2']
                }
            ],
            defaultValue: '-default-'
        },
        {
            action: '-key-2-',
            executionOrder: TableRowType.Configuration,
            executionType: ExecutionType.PropertySetter,
            contextProperty: 'config.conf',
            parameterType: ParaType.True,
            selectorType: SelectorType.False,
            validatorDef: [
                {
                    name: 'validator-1',
                    parameter: ['para-1', 'para-2']
                }
            ],
            defaultValue: '-default-'
        }
    ],
    runtime: {
        type: 'node-fork',
        startup: RuntimeStartUp.EACH,
        configuration: {
            path: './extensions/text-extension'
        }
    }
} as TestExecutionUnitConfig);

/**
 *
 */
class ValidatorFactoryMock implements ValidatorFactory {
    /**
     *
     */
    constructor(
        public name,
        public type: ValidatorType
    ) {}

    /**
     *
     */
    check(para: string | Array<string> | object): boolean {
        ObjectValidator.instance(para).notNull().shouldArray('string');
        return true;
    }

    /**
     *
     */
    create(): RowValidator {
        return null;
    }
}

/**
 *
 */
class RemoteProxyFactory implements ExecutionProxyFactory {
    private name: string;
    private config: object;
    /**
     *
     */
    init(name: string, config: object): void {
        this.name = name;
        this.config = config;
    }

    /**
     *
     */
    validate(basePath: string): void {
        ObjectValidator.instance(this.config, null, basePath)
            .notNull()
            .shouldObject()
            .containsProperties(['path'])
            .prop('path')
            .shouldString();
    }

    /**
     *
     */
    start() {}

    /**
     *
     */
    createExecutionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        return null;
    }
}

/**
 *
 */
let config: TestExecutionUnitConfig;
beforeEach(() => {
    ValidatorFactoryManager.instance.clear();
    ValidatorFactoryManager.instance.addFactory(new ValidatorFactoryMock('validator-1', ValidatorType.ROW));
    ValidatorFactoryManager.instance.addFactory(new ValidatorFactoryMock('validator-2', ValidatorType.ROW));
    ValidatorFactoryManager.instance.addFactory(new ValidatorFactoryMock('group-val', ValidatorType.GROUP));

    ExecutionProxyFactoryHandler.instance.clear();
    ExecutionProxyFactoryHandler.instance.addFactory('grpc', new RemoteProxyFactory());
    ExecutionProxyFactoryHandler.instance.addFactory('node-fork', new RemoteProxyFactory());
    ExecutionProxyFactoryHandler.instance.addFactory('direct', new DirectExecutionProxyFactory());

    GroupRowDefinition.getInstance('group-1').addGroupValidation(null);
    GroupRowDefinition.getInstance('group-2').addGroupValidation(null);

    TableHandlerInstances.instance.clear();

    config = JSON.parse(defaultConfig);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));
});

/**
 *
 */
describe('configurationParser', () => {
    /**
     *
     */
    test('contextProperty must have the correct first level', () => {
        config.rowDef[0].contextProperty = 'conf';
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Problem while reading configuration of $.rowDef[action:'-key-', index:0]. Reading $.rowDef[0].contextPropery: context 'conf' does not exists. Available: 'config', 'preExecution', 'execution'`
        );
    });

    /**
     *
     */
    test('contextProperty must have the correct second level', () => {
        config.rowDef[0].contextProperty = 'config.config';
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Problem while reading configuration of $.rowDef[action:'-key-', index:0]. Reading $.rowDef[0].contextPropery: context 'config.config' does not exists. Available: 'config.conf', 'config.conf2'`
        );
    });

    /**
     *
     */
    test('validator must be correct', () => {
        config.rowDef[0].validatorDef[0].name = '-validator-';
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Problem while reading configuration of $.rowDef[action:'-key-', index:0]. Validator '-validator-' does not exist. Available validators: \n'validator-1',\n'validator-2'`
        );
    });

    /**
     *
     */
    test('validator must have the correct type', () => {
        config.rowDef[0].validatorDef[0].name = 'group-val';
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Problem while reading configuration of $.rowDef[action:'-key-', index:0]. Incorrect validator type validatorDef[name = 'group-val', index:0], must be of type 'row'. Available:\n - 'validator-1',\n - 'validator-2'`
        );
    });

    /**
     *
     */
    test('validator parameter must be correct', () => {
        config.rowDef[0].validatorDef[0].parameter = {};
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Problem while reading configuration of $.rowDef[action:'-key-', index:0]. Cannot parse validator validatorDef[name = 'validator-1', index:0].parameter\npath: '$'. Is not of type array<string>, it's: '{}'`
        );
    });

    /**
     *
     */
    test('group row defs must be correct', () => {
        config.groupRowDef = ['group-x', 'group-y'];
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Reading boart configuration 'extensions/text-extension/boart.json'.\npath: $.groupRowDef.0\nvalue 'group-x' is not allowd for property 'groupRowDef'. Available:\n - 'group-1',\n - 'group-2'`
        );
    });

    /**
     *
     */
    test('runtime configuration must be correct', () => {
        config.runtime.configuration = {};
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        expect(() => sut.readDefinitions()).toThrow(
            `Reading boart configuration 'extensions/text-extension/boart.json'.\nProblem while runtime configuration. path: $.runtime.configuration\nmust contain property 'path', but only contains ''`
        );
    });

    /**
     *
     */
    test('duplicate command cannot exist', () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        sut.readDefinitions();

        expect(() => sut.readDefinitions()).toThrow(
            `Reading boart configuration 'extensions/text-extension/boart.json'.\nCommand: -rest call- already exists`
        );

        const tableHandlers = Array.from(TableHandlerInstances.instance.values).map(([name]) => name);
        expect(tableHandlers).toStrictEqual(['-rest call-']);
    });

    /**
     *
     */
    test('table handler must contain the configuration', () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        sut.readDefinitions();

        const tableHandlers = Array.from(TableHandlerInstances.instance.values).map(([name]) => name);
        expect(tableHandlers).toStrictEqual(['-rest call-']);
    });
});

/**
 *
 */
describe('direct configuration', () => {
    /**
     *
     */
    class MockExecutionUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        key = Symbol('test call');

        /**
         *
         */
        execute(context: DefaultContext): void | Promise<void> {
            context.execution.data = new TextContent(`config.conf: ${context.config['conf']}`);
        }
    }

    /**
     *
     */
    let executionConfig: TestExecutionUnitConfig;
    beforeEach(() => {
        executionConfig = JSON.parse(
            JSON.stringify({
                name: 'test call',
                context: {
                    config: {
                        conf: ''
                    },
                    pre: {},
                    execution: {
                        data: {},
                        transformed: {},
                        header: {}
                    }
                },
                groupRowDef: [],
                groupValidatorDef: [],
                rowDef: [
                    {
                        action: 'set-conf',
                        executionType: ExecutionType.PropertySetter,
                        executionOrder: TableRowType.Configuration,
                        contextProperty: 'config.conf',
                        parameterType: ParaType.True,
                        selectorType: SelectorType.False,
                        validatorDef: [],
                        defaultValue: ''
                    }
                ],
                runtime: {
                    type: 'direct',
                    startup: RuntimeStartUp.EACH,
                    configuration: null
                }
            })
        );
        executionConfig.runtime.configuration = () => new MockExecutionUnit();
    });

    /**
     *
     */
    test('one definition', async () => {
        const tableDef = MarkdownTableReader.convert(
            `| action   | value |
             |----------|-------|
             | set-conf | xxx   |`
        );

        const sut = new ConfigurationParser();
        const handler = sut.parseDefinition(executionConfig).handler;
        await handler.process(tableDef);

        const context = handler.getExecutionEngine().context;
        expect(context.execution.data.valueOf()).toBe('config.conf: xxx');
    });

    /**
     *
     */
    test('two definitions', async () => {
        executionConfig.rowDef.push({
            action: 'set-config-2',
            executionType: ExecutionType.PropertySetter,
            executionOrder: TableRowType.Configuration,
            contextProperty: 'config.conf2',
            parameterType: ParaType.True,
            selectorType: SelectorType.False,
            validatorDef: [],
            defaultValue: ''
        });

        Object.defineProperty(executionConfig.context.config, 'conf2', {
            writable: true,
            value: ''
        });

        const executionUnit = new MockExecutionUnit();
        executionConfig.runtime.configuration = () => executionUnit;
        executionUnit.execute = (context: DefaultContext) => {
            context.execution.data = new TextContent(`config.conf: ${context.config['conf']}, config.conf2: ${context.config['conf2']}`);
        };

        const tableDef = MarkdownTableReader.convert(
            `| action       | value |
             |--------------|-------|
             | set-config   | xxx   |
             | set-config-2 | yyy   |`
        );

        const sut = new ConfigurationParser();
        const handler = sut.parseDefinition(executionConfig).handler;
        await handler.process(tableDef);

        const context = handler.getExecutionEngine().context;
        expect(context.execution.data.valueOf()).toBe('config.conf: xxx, config.conf2: yyy');
    });
});
