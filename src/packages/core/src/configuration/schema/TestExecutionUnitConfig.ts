import { ContextConfig } from './ContextConfig';
import { RowDefinitionConfig } from './RowDefinitionConfig';
import { Runtime } from './Runtime';

/**
 *
 */
export interface TestExecutionUnitConfig {
    name: string;
    runtime: Runtime;
    context: ContextConfig;
    groupRowDef: Array<string>;
    rowDef: Array<RowDefinitionConfig>;
}
