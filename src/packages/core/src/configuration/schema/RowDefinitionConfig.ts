import { TableRowType } from '../../table/TableRowType';
import { ParaType } from '../../types/ParaType';
import { SelectorType } from '../../types/SelectorType';
import { ExecutionType } from './ExecutionType';
import { ValidatorConfig } from './ValidatorConfig';

/**
 *
 */
export interface RowDefinitionConfig {
    action: string;
    executionType: ExecutionType;
    executionOrder?: TableRowType;
    contextProperty?: string;
    parameterType?: ParaType;
    selectorType?: SelectorType;
    validatorDef?: Array<ValidatorConfig>;
    defaultValue?: string;
}
