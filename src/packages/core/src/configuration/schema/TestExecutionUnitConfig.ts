import { ContextConfig } from './ContextConfig';
import { RowDefinitionConfig } from './RowDefinitionConfig';
import { Runtime } from './Runtime';
import { ValidatorConfig } from './ValidatorConfig';

/**
 *
 */
export interface TestExecutionUnitConfig {
    name: string;
    runtime: Runtime;
    context: ContextConfig;
    groupRowDef: Array<string>;
    groupValidatorDef: Array<ValidatorConfig>;
    rowDef: Array<RowDefinitionConfig>;
}
