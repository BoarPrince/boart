import { TableRowType } from '../../table/TableRowType';
import { ParaType } from '../../types/ParaType';
import { SelectorType } from '../../types/SelectorType';
import { ValidatorConfig } from './ValidatorConfig';

/**
 *
 */
export interface RowDefinitionConfig {
    action: string;
    contextType: TableRowType;
    parameterType: ParaType;
    selectorType: SelectorType;
    contextProperty: string;
    validatorDef: Array<ValidatorConfig>;
    defaultValue?: string;
}
