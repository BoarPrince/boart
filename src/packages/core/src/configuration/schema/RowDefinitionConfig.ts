import { TableRowType } from '../../table/TableRowType';
import { ParaType } from '../../types/ParaType';
import { SelectorType } from '../../types/SelectorType';
import { ValidatorConfig } from './ValidatorConfig';

/**
 *
 */
export interface RowDefinitionConfig {
    key: string;
    type: TableRowType;
    parameterType: ParaType;
    selectorType: SelectorType;
    propertyDef: string;
    validatorDef: Array<ValidatorConfig>;
    defaultValue: string;
}
