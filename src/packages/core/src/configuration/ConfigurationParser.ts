import fs from 'fs';

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
import { EnvLoader } from '../common/EnvLoader';
import { ConfigurationLookup } from './ConfigurationLookup';

/**
 *
 */
export class ConfigurationParser {
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
        return (validatorConfig || []).map((config, index) => {
            const factory = ValidatorFactoryManager.instance.getRowFactory(config.name);
            try {
                factory.check(config.parameter);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`Cannot parse validator validatorDef[name = '${config.name}', index:${index}].parameter\n${error.message}`);
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
        const defs = rowDefinitions.map((rowDef: RowDefinitionConfig, index) => {
            try {
                const key = Symbol(rowDef.action);

                const [firstLevel, secondLevel] = rowDef.contextProperty.split('.');

                if (context[firstLevel] === undefined) {
                    throw new Error(
                        `Reading $.rowDef[${index}].contextPropery: context '${
                            rowDef.contextProperty
                        }' does not exists. Available: ${Object.keys(context)
                            .map((c) => `'${c}'`)
                            .join(', ')}`
                    );
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (secondLevel && context[firstLevel][secondLevel] === undefined) {
                    throw new Error(
                        `Reading $.rowDef[${index}].contextPropery: context '${
                            rowDef.contextProperty
                        }' does not exists. Available: ${Object.keys(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            context[firstLevel]
                        )
                            .map((c) => `'${firstLevel}.${c}'`)
                            .join(', ')}`
                    );
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
                throw new Error(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `Problem while reading configuration of $.rowDef[action:'${rowDef.action}', index:${index}]. ${error.message}`
                );
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
        try {
            factory.validate('$.runtime.configuration');
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new Error(`Problem while runtime configuration. ${error.message}`);
        }
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
        const lookup = new ConfigurationLookup(EnvLoader.instance.getExtensionDir());
        const definitionFiles = lookup.lookup();
        for (const definitionFilename of definitionFiles) {
            try {
                const tableHandler = this.parseDefinition(definitionFilename);
                TableHandlerInstances.instance.add(tableHandler.handler, tableHandler.name);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`Reading boart configuration '${definitionFilename}'.\n${error.message}`);
            }
        }
    }
}
