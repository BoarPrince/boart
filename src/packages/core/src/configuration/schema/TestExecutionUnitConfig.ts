import { ContextConfig } from './ContextConfig';
import { RowDefinitionConfig } from './RowDefinitionConfig';
import { RuntimeType } from './RuntimeType';

/**
 *
 */
export interface TestExecutionUnitConfig {
    name: string;
    runtimeType: RuntimeType;
    runtimePath: string;
    contextDef: ContextConfig;
    groupRowDef: Array<string>;
    rowDef: Array<RowDefinitionConfig>;
}
