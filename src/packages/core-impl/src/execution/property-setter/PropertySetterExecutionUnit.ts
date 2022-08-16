import { ContentType, DataContentHelper, ExecutionContext, ExecutionUnit, ObjectContent, ParaType } from '@boart/core';

import { DataExecutionContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

type Config = {
    concat?: boolean;
    delimiter?: string;
    defaultModifier?: (rowValue: ContentType) => ContentType;
    actionSelectorModifier?: (rowValue: ContentType) => ContentType;
    defaultSetter?: (value: ContentType, rowValue: ContentType, para: string) => ContentType;
    defaultTypeConverter?: (value: ContentType) => ContentType;
    actionSelectorSetter?: (value: ContentType, rowValue: ContentType, selector: string) => ContentType;
};

/**
 *
 */
export class PropertySetterExecutionUnit<
    TExecutionContext extends ExecutionContext<object, object, DataExecutionContext>,
    TRowType extends RowTypeValue<TExecutionContext>
> implements ExecutionUnit<TExecutionContext, TRowType>
{
    /**
     *
     */
    constructor(propertyLevel1: 'config', propertyLevel2?: keyof TExecutionContext['config'], config?: Config);
    constructor(propertyLevel1: 'execution', propertyLevel2?: keyof TExecutionContext['execution'], config?: Config);
    constructor(propertyLevel1: 'preExecution', propertyLevel2?: keyof TExecutionContext['preExecution'], config?: Config);
    constructor(private readonly propertyLevel1: string, private readonly propertyLevel2?: string, private readonly config?: Config) {
        this.config = config || {};
        this.config.concat = this.config.concat || false;
        this.config.delimiter = this.config.delimiter || '\n';
        this.config.defaultModifier = this.config.defaultModifier || ((value: ContentType) => value);
        this.config.actionSelectorModifier = this.config.actionSelectorModifier || this.config.defaultModifier;

        this.config.defaultSetter = this.config.defaultSetter || this.defaultSetter.bind(this);
        this.config.defaultTypeConverter = this.config.defaultTypeConverter || ((value: ContentType) => value);

        this.config.actionSelectorSetter = this.config.actionSelectorSetter || this.defaultActionSelectorSetter.bind(this);
    }

    /**
     *
     */
    readonly description = 'Generic Property Setter';

    /**
     * allow :null to set null
     */
    readonly parameterType = ParaType.Optional;
    readonly validators = [];

    /**
     *
     */
    private defaultSetter(value: ContentType, rowValue: ContentType): ContentType {
        const delimiter = !value ? '' : this.config.delimiter;
        const toString = (val: ContentType) => val?.toString() || '';
        return this.config.concat === false //
            ? rowValue
            : `${toString(value)}${delimiter.toString()}${toString(rowValue)}`;
    }

    /**
     *
     */
    private defaultActionSelectorSetter(value: ContentType, rowValue: ContentType, selector: string): ContentType {
        const val = DataContentHelper.create(!DataContentHelper.isObject(value) ? new ObjectContent(value) : value);
        return DataContentHelper.setByPath(selector, rowValue, val);
    }

    /**
     *
     */
    execute(context: TExecutionContext, row: TRowType): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        /**
         * accessor if only the first property is used
         */
        const oneLevel = {
            get val(): ContentType {
                return context[self.propertyLevel1];
            },
            set val(value: ContentType) {
                context[self.propertyLevel1] = value;
            }
        };

        /**
         * accessor if both properties are used
         */
        const twoLevel = {
            get val(): ContentType {
                return context[self.propertyLevel1][self.propertyLevel2];
            },
            set val(value: ContentType) {
                context[self.propertyLevel1][self.propertyLevel2] = value;
            }
        };

        const accessor = !this.propertyLevel2 ? oneLevel : twoLevel;

        const result = {
            modifiedValue: null as ContentType,
            value: null as ContentType
        };
        if (!row.data.selector) {
            result.modifiedValue = this.config.defaultModifier(row.value);
            result.value = this.config.defaultSetter(accessor.val, result.modifiedValue, row.actionPara);
        } else {
            result.modifiedValue = this.config.actionSelectorModifier(row.value);
            result.value = this.config.actionSelectorSetter(accessor.val, result.modifiedValue, row.data.selector);
        }

        accessor.val = this.config.defaultTypeConverter(result.value);
    }
}
