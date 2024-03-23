import { DefaultContext } from '../default/DefaultExecutionContext';
import { ASTAction } from '../parser/ast/ASTAction';

/**
 *
 */
export interface PluginRequest {
    context: DefaultContext;
    action: { name: string; ast: ASTAction };
    value: string | number | boolean;
    additionalValue: string | number | boolean;
}
