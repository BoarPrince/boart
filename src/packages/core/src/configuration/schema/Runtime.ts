import { DefaultContext } from '../../default/DefaultExecutionContext';
import { DefaultRowType } from '../../default/DefaultRowType';
import { ExecutionUnit } from '../../execution/ExecutionUnit';
import { RuntimeStartUp } from './RuntimeStartUp';

/**
 *
 */

export interface Runtime {
    type: string;
    startup: RuntimeStartUp;
    configuration: object | ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>>;
}
