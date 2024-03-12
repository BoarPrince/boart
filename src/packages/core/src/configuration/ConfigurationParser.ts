import fs from 'fs';

import { ContextConfig } from './schema/ContextConfig';
import { RowDefinition as CoreRowDefinition } from '../table/RowDefinition';
import { RowDefinitionConfig } from './schema/RowDefinitionConfig';
import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';
import { DefaultPropertySetterExecutionUnit } from '../default/DefaultPropertySetterExecutionUnit';
import { RowValidator } from '../validators/RowValidator';
import { ValidatorFactoryManager } from '../validators/ValidatorFactoryManager';
import { ValidatorConfig } from './schema/ValidatorConfig';
import { ExecutionUnitPluginFactory } from '../plugin/ExecutionUnitPluginFactory';
import { ConfigurationTableHandler } from './ConfigurationTableHandler';
import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { TableHandlerInstances } from '../table/TableHandlerInstances';
import { EnvLoader } from '../common/EnvLoader';
import { ConfigurationLookup } from './ConfigurationLookup';
import { GroupValidator } from '../validators/GroupValidator';
import { ValidatorType } from '../validators/ValidatorType';
import { ExecutionType } from './schema/ExecutionType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { ConfigurationChecker } from './ConfigurationChecker';
import { Runtime } from './schema/Runtime';
import { ExecutionUnitPluginAdapter } from '../plugin/ExecutionUnitPluginAdapter';
import { ExecutionUnitPluginHandler } from '../plugin/ExecutionUnitPluginHandler';
import { DirectExecutionPluginFactory } from '../plugin/DirectExecutionPluginFactory';
import { ExecutionUnitPluginFactoryHandler } from '../plugin/ExecutionUnitPluginFactoryHandler';
import { ExecutionUnitPlugin } from '../plugin/ExecutionUnitPlugin';

/**
 *
 */
export class ConfigurationParser {
    /**
     *
     */
    private executionHandler = new ExecutionUnitPluginHandler();

    /**
     *
     */
    private parseContext(contextDef: ContextConfig): DefaultContext {
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
    private parseValidator(
        validatorConfig: Array<ValidatorConfig>,
        type: ValidatorType,
        basePath: string
    ): Array<RowValidator> | Array<GroupValidator> {
        return (validatorConfig || []).map((config, index) => {
            const factory = ValidatorFactoryManager.instance.getFactory(config.name);
            try {
                factory.check(config.parameter);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`Cannot parse validator ${basePath}.validatorDef[name = '${config.name}'].parameter\n${error.message}`);
            }

            if (factory.type !== type) {
                throw new Error(
                    `Incorrect validator type validatorDef[name = '${
                        config.name
                    }', index:${index}], must be of type '${type}'. Available:${ValidatorFactoryManager.instance
                        .validFactoriesByType(type)
                        .map((f) => `\n - '${f}'`)
                        .join(',')}`
                );
            }

            return factory.create(config.parameter) as RowValidator;
        });
    }

    /**
     *
     */
    private getPropertySetterExecutionUnit(
        rowDef: RowDefinitionConfig,
        context: DefaultContext,
        index: number
    ): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        const [firstLevel, secondLevel] = rowDef.contextProperty.split('.');

        if (context[firstLevel] === undefined) {
            throw new Error(
                `Reading $.rowDef[${index}].contextPropery: context '${rowDef.contextProperty}' does not exists. Available: ${Object.keys(
                    context
                )
                    .map((c) => `'${c}'`)
                    .join(', ')}`
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (secondLevel && context[firstLevel][secondLevel] === undefined) {
            throw new Error(
                `Reading $.rowDef[${index}].contextPropery: context '${rowDef.contextProperty}' does not exists. Available: ${Object.keys(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    context[firstLevel]
                )
                    .map((c) => `'${firstLevel}.${c}'`)
                    .join(', ')}`
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new DefaultPropertySetterExecutionUnit<any, any>(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            firstLevel as any,
            secondLevel
        );
    }

    /**
     *
     */
    private parseRowDefinition(
        config: TestExecutionUnitConfig,
        context: DefaultContext,
        mainExecutionUnitFactory: ExecutionUnitPluginFactory
    ): Array<CoreRowDefinition<DefaultContext, DefaultRowType<DefaultContext>>> {
        const defs = config.rowDef.map((rowDef: RowDefinitionConfig, index) => {
            try {
                const key = Symbol(rowDef.action);
                const basePath = `$.rowDef[${index}]`;

                const executionUnit = (() => {
                    if (rowDef.executionType === ExecutionType.PropertySetter) {
                        ConfigurationChecker.checkPropertySetter(rowDef, basePath);
                        return this.getPropertySetterExecutionUnit(rowDef, context, index);
                    } else {
                        ConfigurationChecker.checkExecutionUnit(rowDef, basePath);
                        const factory = rowDef.runtime
                            ? this.getExecutionUnitFactory(rowDef.runtime, rowDef.action, `${basePath}.runtime`)
                            : mainExecutionUnitFactory;

                        return new ExecutionUnitPluginAdapter(key, factory);
                    }
                })();

                return new CoreRowDefinition<DefaultContext, DefaultRowType<DefaultContext>>({
                    key,
                    type: rowDef.executionOrder,
                    parameterType: rowDef.parameterType,
                    selectorType: rowDef.selectorType,
                    defaultValue: rowDef.defaultValue,
                    defaultValueColumn: rowDef.defaultValue ? Symbol('value') : undefined,
                    executionUnit,
                    validators: this.parseValidator(rowDef.validatorDef, ValidatorType.ROW, basePath) as Array<RowValidator>
                });
            } catch (error) {
                throw new Error(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `Problem while reading configuration of $.rowDef[${index}]\n${error.message}`
                );
            }
        });

        return defs;
    }

    /**
     *
     */
    private getExecutionUnitFactory(runtime: Runtime, name: string, basePath: string): ExecutionUnitPluginFactory {
        const factory = ExecutionUnitPluginFactoryHandler.instance.getFactory(runtime.type);
        if (factory.isLocal === true) {
            const localFactory = new DirectExecutionPluginFactory();
            this.executionHandler.addExecutionUnit(name, () => localFactory.createExecutionUnit());
            const pluginExecutionUnit = runtime.configuration as () => ExecutionUnitPlugin;
            localFactory.init(name, pluginExecutionUnit, runtime.startup);
            return localFactory;
        } else {
            try {
                factory.init(name, runtime.configuration, runtime.startup);
                factory.validate(basePath);
            } catch (error) {
                (error as Error).message = 'Problem while runtime configuration.\n' + (error as Error).message;
                throw error;
            }
            return factory;
        }
    }

    /**
     *
     */
    private readDefinition(configFileName: string): TestExecutionUnitConfig {
        const content = fs.readFileSync(configFileName, 'utf-8');
        return JSON.parse(content) as TestExecutionUnitConfig;
    }

    /**
     *
     */
    public parseDefinition(configOrFileName: TestExecutionUnitConfig | string): ConfigurationTableHandler {
        const config: TestExecutionUnitConfig =
            typeof configOrFileName === 'string' ? this.readDefinition(configOrFileName) : configOrFileName;

        ConfigurationChecker.check(config);

        const context = this.parseContext(config.context);
        const executionUnitFactory = this.getExecutionUnitFactory(config.runtime, config.name, '$.runtime.configuration');

        const rowDefinitions = this.parseRowDefinition(config, context, executionUnitFactory);
        const groupValidations = this.parseValidator(
            config.groupValidatorDef,
            ValidatorType.GROUP,
            '$.groupValidatorDef'
        ) as Array<GroupValidator>;
        const groupRows = config.groupRowDef;

        return new ConfigurationTableHandler(config.name, context, executionUnitFactory, rowDefinitions, groupRows, groupValidations);
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
