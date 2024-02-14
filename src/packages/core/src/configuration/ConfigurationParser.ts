import fs from 'fs';
import fsPath from 'path';

import { ContextConfig } from './schema/ContextConfig';
import { RowDefinition as CoreRowDefinition } from '../table/RowDefinition';
import { RowDefinitionConfig } from './schema/RowDefinitionConfig';
import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';
import { DefaultPropertySetterExecutionUnit } from '../default/DefaultPropertySetterExecutionUnit';
import { RowValidator } from '../validators/RowValidator';
import { ValidatorFactoryManager } from '../validators/ValidatorFactoryManager';
import { ValidatorConfig } from './schema/ValidatorConfig';
import { ConfigurationChecker } from './ConfigurationChecker';
import { RemoteFactory } from '../remote/RemoteFactory';
import { RemoteFactoryHandler } from '../remote/RemoteFactoryHandler';
import { ConfigurationTableHandler } from './ConfigurationTableHandler';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { TableHandlerInstances } from '../table/TableHandlerInstances';

/**
 *
 */
export class ConfigurationParser {
    private readonly fileEnding = '.bdef';

    /**
     *
     */
    private lookup(path: string): Array<string> {
        const foundDefinitions = new Array<string>();
        const files = fs.readdirSync(path);

        for (const file of files) {
            const filePath = fsPath.join(path, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isDirectory()) {
                foundDefinitions.concat(this.lookup(filePath));
            } else if (file.endsWith(this.fileEnding)) {
                foundDefinitions.push(file);
            }
        }

        return foundDefinitions;
    }

    /**
     *
     */
    private parseConfig(contextDef: ContextConfig): DefaultContext {
        const context: DefaultContext = {
            config: {},
            preExecution: {
                payload: {}
            },
            execution: {
                data: {},
                transformed: {},
                header: {}
            }
        };

        context.config = contextDef.config;
        context.preExecution.payload = contextDef.pre;
        context.execution.data = contextDef.execution.data;
        context.execution.header = contextDef.execution.header;
        context.execution.transformed = contextDef.execution.transformed;

        return context;
    }

    /**
     *
     */
    private parseValidator(validatorConfig: Array<ValidatorConfig>): Array<RowValidator> {
        return (validatorConfig || []).map((config) => {
            const factory = ValidatorFactoryManager.instance.getRowFactory(config.name);
            try {
                factory.check(config.parameter);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`cannot parse parameter of validator ${config.name}\n${error.message}`);
            }
            return factory.create(config.parameter) as RowValidator;
        });
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parseRowDefinition(
        rowDefinitions: RowDefinitionConfig[],
        context: DefaultContext
    ): Array<CoreRowDefinition<DefaultContext, DefaultRowType<DefaultContext>>> {
        const defs = rowDefinitions.map((rowDef: RowDefinitionConfig) => {
            try {
                const key = Symbol(rowDef.action);

                const [firstLevel, secondLevel] = rowDef.contextProperty.split('.');

                if (context[firstLevel] === undefined) {
                    throw new Error(`reading propertyDef: context './${firstLevel}' does not exists`);
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (secondLevel && context[firstLevel][secondLevel] === undefined) {
                    throw new Error(`reading propertyDef: context '.${firstLevel}.${secondLevel}' does not exists`);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const executionUnit = new DefaultPropertySetterExecutionUnit<any, any>(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                    firstLevel as any,
                    secondLevel
                );

                return new CoreRowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
                    key,
                    type: rowDef.contextType,
                    parameterType: rowDef.parameterType,
                    selectorType: rowDef.selectorType,
                    defaultValue: rowDef.defaultValue,
                    defaultValueColumn: rowDef.defaultValue ? Symbol('value') : undefined,
                    executionUnit,
                    validators: this.parseValidator(rowDef.validatorDef)
                });
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`problem while reading configuration of key ${rowDef.action}\n${error.message}`);
            }
        });

        return defs;
    }

    /**
     *
     */
    private parseMainExecutionUnit(config: TestExecutionUnitConfig): RemoteFactory {
        const factory = RemoteFactoryHandler.instance.getFactory(config.runtime.type);
        factory.init(config.name, config.runtime.configuration, config.runtime.startup);
        factory.validate();
        return factory;
    }

    /**
     *
     */
    private parseDefinition(configFilename: string): ConfigurationTableHandler {
        const content = fs.readFileSync(configFilename, 'utf-8');
        const config = JSON.parse(content) as TestExecutionUnitConfig;
        ConfigurationChecker.checkJSONConfig(config);

        const context = this.parseConfig(config.context);
        const rowDefinitions = this.parseRowDefinition(config.rowDef, context);
        const mainExecutionUnitFactory = this.parseMainExecutionUnit(config);

        return new ConfigurationTableHandler(config.name, context, mainExecutionUnitFactory, rowDefinitions, config.groupRowDef);
    }

    /**
     *
     */
    public readDefinitions() {
        const definitionFiles = this.lookup('');
        for (const definitionFilename of definitionFiles) {
            const tableHandler = this.parseDefinition(definitionFilename);
            TableHandlerInstances.instance.add(tableHandler.handler, tableHandler.name);
        }
    }
}
