import { ExecutionContext } from '../../../common/execution/ExecutionContext';
import { ExecutionUnit } from '../../../common/execution/ExecutionUnit';
import { ContentType } from '../../../data/ContentType';
import { DataContentHelper } from '../../../data/DataContentHelper';
import { ObjectContent } from '../../../data/ObjectContent';
import { DataExecutionContext } from '../../DataExecutionContext';
import { RowTypeValue } from '../../RowTypeValue';

type Config = {
    concat?: boolean;
    delimiter?: string;
    defaultModifier?: (rowValue: ContentType) => ContentType;
    actionParaModifier?: (rowValue: ContentType) => ContentType;
    defaultSetter?: (value: ContentType, rowValue: ContentType) => ContentType;
    actionParaSetter?: (value: ContentType, rowValue: ContentType, para: string) => ContentType;
};

/**
 *
 */
export class PropertySetterExecutionUnit<
    TExecutionContext extends ExecutionContext<object, object, DataExecutionContext>,
    TRowType extends RowTypeValue<TExecutionContext>
> implements ExecutionUnit<TExecutionContext, TRowType> {
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
        this.config.actionParaModifier = this.config.actionParaModifier || this.config.defaultModifier;
        this.config.defaultSetter = this.config.defaultSetter || this.defaultSetter.bind(this);
        this.config.actionParaSetter = this.config.actionParaSetter || this.defaultActionParaSetter.bind(this);
    }

    /**
     *
     */
    readonly description = 'Generic Property Setter';

    /**
     *
     */
    private defaultSetter(value: ContentType, rowValue: ContentType): ContentType {
        const delimiter = !value ? '' : this.config.delimiter;
        return this.config.concat === false ? rowValue : `${value || ''}${delimiter}${rowValue}`;
    }

    /**
     *
     */
    private defaultActionParaSetter(value: ContentType, rowValue: ContentType, para: string): ContentType {
        const val = DataContentHelper.create(new ObjectContent(value));
        return DataContentHelper.setByPath(para, rowValue, val).toJSON();
    }

    /**
     *
     */
    execute(context: TExecutionContext, row: TRowType): void {
        const _this = this;
        /**
         * accessor if only the first property is used
         */
        const oneLevel = {
            get val(): ContentType {
                return context[_this.propertyLevel1];
            },
            set val(value: ContentType) {
                context[_this.propertyLevel1] = value;
            }
        };

        /**
         * accessor if both properties are used
         */
        const twoLevel = {
            get val(): ContentType {
                return context[_this.propertyLevel1][_this.propertyLevel2];
            },
            set val(value: ContentType) {
                context[_this.propertyLevel1][_this.propertyLevel2] = value;
            }
        };

        const accessor = !this.propertyLevel2 ? oneLevel : twoLevel;
        if (!row.actionPara) {
            accessor.val = this.config.defaultSetter(accessor.val, this.config.defaultModifier(row.value));
        } else {
            accessor.val = this.config.actionParaSetter(accessor.val, this.config.actionParaModifier(row.value), row.actionPara);
        }
    }
}
