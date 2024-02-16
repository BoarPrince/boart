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
import { RemoteFactoryHandler } from '../remote/RemoteFactoryHandler';
import { RemoteFactory } from '../remote/RemoteFactory';
import { GroupRowDefinition } from '../table/GroupRowDefinition';
import { TableHandlerInstances } from '../table/TableHandlerInstances';

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
            name: '-group-name-',
            parameter: {}
        }
    ],
    rowDef: [
        {
            action: '-key-',
            contextType: TableRowType.Configuration,
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
            contextType: TableRowType.Configuration,
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
    constructor(public name) {}

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
class RemoteProxyFactory implements RemoteFactory {
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
    executionUnit: null;
}

/**
 *
 */
let config: TestExecutionUnitConfig;
beforeEach(() => {
    ValidatorFactoryManager.instance.clear();
    ValidatorFactoryManager.instance.addFactory(new ValidatorFactoryMock('validator-1'));
    ValidatorFactoryManager.instance.addFactory(new ValidatorFactoryMock('validator-2'));

    RemoteFactoryHandler.instance.clear();
    RemoteFactoryHandler.instance.addFactory('grpc', new RemoteProxyFactory());
    RemoteFactoryHandler.instance.addFactory('node-fork', new RemoteProxyFactory());

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
            `Reading boart configuration 'extensions/text-extension/boart.json'.\npath: $.groupRowDef.0\nvalue 'group-x' is not allowd for property 'groupRowDef'. Allowed values are => 'group-1, group-2'`
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

        const tableHandlers = Array.from(TableHandlerInstances.instance.values).map(([name, _]) => name);
        expect(tableHandlers).toStrictEqual(['-rest call-']);
    });

    /**
     *
     */
    test('table handler must contain the configuration', () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(config));

        const sut = new ConfigurationParser();
        sut.readDefinitions();

        const tableHandlers = Array.from(TableHandlerInstances.instance.values).map(([name, _]) => name);
        expect(tableHandlers).toStrictEqual(['-rest call-']);
    });
});
