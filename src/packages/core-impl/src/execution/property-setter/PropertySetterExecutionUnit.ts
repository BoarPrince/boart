import {
    ContentType,
    DataContentHelper,
    DataType,
    ExecutionContext,
    ExecutionUnit,
    ObjectContent,
    ParaType,
    SelectorExtractor
} from '@boart/core';
import { ASTVariable } from 'core/src/parser/ast/ASTVariable';

import { RowTypeValue } from '../../RowTypeValue';

type Config = {
    concat?: boolean;
    delimiter?: string;
    resultType?: DataType;
    defaultModifier?: (rowValue: ContentType) => ContentType;
    actionSelectorModifier?: (rowValue: ContentType) => ContentType;
    defaultSetter?: (value: ContentType, rowValue: ContentType, para: string) => ContentType;
    defaultTypeConverter?: (value: ContentType, type?: DataType) => ContentType;

    actionSelectorSetter?: (value: ContentType, rowValue: ContentType, ast: ASTVariable) => ContentType;
};

/**
 *
 */
export class PropertySetterExecutionUnit<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends RowTypeValue<TExecutionContext>
> implements ExecutionUnit<TExecutionContext, TRowType>
{
    /**
     *
     */
    constructor(propertyLevel1: 'config', propertyLevel2?: keyof TExecutionContext['config'], config?: Config);
    constructor(propertyLevel1: 'execution', propertyLevel2?: keyof TExecutionContext['execution'], config?: Config);
    constructor(propertyLevel1: 'preExecution', propertyLevel2?: keyof TExecutionContext['preExecution'], config?: Config);
    constructor(
        private readonly propertyLevel1: string,
        private readonly propertyLevel2?: string,
        private readonly config?: Config
    ) {
        this.config = config || {};
        this.config.concat = this.config.concat || false;
        this.config.delimiter = this.config.delimiter || '\n';
        this.config.defaultModifier = this.config.defaultModifier || ((value: ContentType) => value);
        this.config.defaultSetter = this.config.defaultSetter || this.defaultSetter.bind(this);
        this.config.defaultTypeConverter = this.config.defaultTypeConverter || this.defaultTypeConverter.bind(this);
        this.config.actionSelectorSetter = this.config.actionSelectorSetter || this.defaultActionSelectorSetter.bind(this);
        this.config.actionSelectorModifier = this.config.actionSelectorModifier || this.config.defaultModifier;
    }

    /**
     *
     */
    readonly description = {
        id: 'propertySetter:unit',
        title: 'Generic Property Setter',
        description: '',
        examples: null
    };

    /**
     * allow :null to set null
     */
    readonly parameterType = ParaType.Optional;
    readonly validators = [];

    /**
     *
     */
    private defaultSetter(value: ContentType, rowValue: ContentType): ContentType {
        if (Array.isArray(value)) {
            value.push(rowValue);
            return value;
        } else {
            const delimiter = !value ? '' : this.config.delimiter;
            const toString = (val: ContentType) => val?.toString() || '';
            return this.config.concat === false //
                ? rowValue
                : `${toString(value)}${delimiter.toString()}${toString(rowValue)}`;
        }
    }

    /**
     *
     */
    private defaultTypeConverter(value: ContentType, type?: DataType): ContentType {
        if (!type || type === DataType.isNullOrUndefined || type === DataType.Unknown) {
            return value;
        }

        switch (type) {
            case DataType.DataContent:
                return DataContentHelper.create(value);
            case DataType.Array:
            case DataType.Object:
                return value;
            case DataType.Boolean:
            case DataType.Number:
                return DataContentHelper.toNative(value as string);
            default:
                return value.toString();
        }
    }

    /**
     *
     */
    private defaultActionSelectorSetter(value: ContentType, rowValue: ContentType, ast: ASTVariable): ContentType {
        const val = DataContentHelper.create(!DataContentHelper.isObject(value) ? new ObjectContent(value) : value);
        return SelectorExtractor.setValueBySelector(ast?.selectors, rowValue, val);
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
        if (!row.data.ast.selectors?.length) {
            result.modifiedValue = this.config.defaultModifier(row.value);
            result.value = this.config.defaultSetter(accessor.val, result.modifiedValue, row.ast.qualifier?.stringValue);
        } else {
            result.modifiedValue = this.config.actionSelectorModifier(row.value);
            result.value = this.config.actionSelectorSetter(accessor.val, result.modifiedValue, row.data.ast);
        }

        accessor.val = this.config.defaultTypeConverter(result.value, this.config?.resultType || DataContentHelper.getType(accessor.val));
    }
}
