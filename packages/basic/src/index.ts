import { ValueReplacerHandler } from '@boart/core';
import { StoreReplacer } from '@boart/core-impl';

import BasicDataGroupDefinition from './basicGroup/BasicDataGroupDefinition';
import BasicGroupDefinition from './basicGroup/BasicGroupDefinition';
import RestCallTableHandler from './rest/RestCallTableHandler';

export { BasicDataGroupDefinition, BasicGroupDefinition, RestCallTableHandler };

/**
 *
 */
function initialize(): void {
    ValueReplacerHandler.instance.add('store', new StoreReplacer());
}

initialize();
