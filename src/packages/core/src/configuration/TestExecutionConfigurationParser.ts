import fs from 'fs';
import fsPath from 'path';

import { ExecutionContext } from '../execution/ExecutionContext';
import { ContextConfig } from './schema/ContextConfig';
import { RowDefinition as CoreRowDefinition } from '../table/RowDefinition';
import { RowDefinitionConfig } from './schema/RowDefinitionConfig';
import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';
import { DefaultPropertySetterExecutionUnit } from '../default/DefaultPropertySetterExecutionUnit';
import { RowValidator } from '../validators/RowValidator';
import { ValidatorFactoryManager } from '../validators/ValidatorFactoryManager';
import { ValidatorConfig } from './schema/ValidatorConfig';

/**
 *
 */
type ExecutionContextType = ExecutionContext<
    object,
    object,
    {
        data: object;
        header: object;
        transformed: object;
    }
>;

/**
 *
 */
export class TestExecutionConfigurationParser {
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
    private parseConfig(contextDef: ContextConfig): ExecutionContextType {
        const context: ExecutionContextType = {
            config: {},
            preExecution: {},
            execution: {
                data: {},
                transformed: {},
                header: {}
            }
        };

        contextDef.config.forEach((prop) => {
            context.config[prop.name] = prop.defaultValue;
        });

        contextDef.pre.forEach((prop) => {
            context.preExecution[prop.name] = prop.defaultValue;
        });

        contextDef.execution.data.forEach((prop) => {
            context.execution.data[prop.name] = prop.defaultValue;
        });

        contextDef.execution.transformed.forEach((prop) => {
            context.execution.transformed[prop.name] = prop.defaultValue;
        });

        contextDef.execution.header.forEach((prop) => {
            context.execution.header[prop.name] = prop.defaultValue;
        });

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
    private parseRowDefinition(rowDefinitions: RowDefinitionConfig[], context: ExecutionContextType): Array<CoreRowDefinition<any, any>> {
        const defs = rowDefinitions.map((rowDef: RowDefinitionConfig) => {
            try {
                const key = Symbol(rowDef.key);

                const [firstLevel, secondLevel] = rowDef.propertyDef.split('.');

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

                return new CoreRowDefinition({
                    key,
                    type: rowDef.type,
                    parameterType: rowDef.parameterType,
                    selectorType: rowDef.selectorType,
                    executionUnit,
                    validators: this.parseValidator(rowDef.validatorDef)
                });
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                throw new Error(`problem while reading configuration of key ${rowDef.key}\n${error.message}`);
            }
        });

        return defs;
    }

    /**
     *
     */
    private parseDefinition(configFilename: string) {
        const content = fs.readFileSync(configFilename, 'utf-8');
        const config = JSON.parse(content) as TestExecutionUnitConfig;

        const context = this.parseConfig(config.contextDef);
        const rowDefinitions = this.parseRowDefinition(config.rowDef, context);
    }

    /**
     *
     */
    public readDefinitions() {
        const definitionFiles = this.lookup('');
        for (const definitionFilename of definitionFiles) {
            this.parseDefinition(definitionFilename);
        }
    }
}
