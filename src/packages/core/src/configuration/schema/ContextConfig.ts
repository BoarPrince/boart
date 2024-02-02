import { ContextConfigItem } from './ContextConfigItem';

/**
 *
 */
export interface ContextConfig {
    config: Array<ContextConfigItem>;
    pre: Array<ContextConfigItem>;
    execution: {
        data: Array<ContextConfigItem>;
        transformed: Array<ContextConfigItem>;
        header: Array<ContextConfigItem>;
    };
}
