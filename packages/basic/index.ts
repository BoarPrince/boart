import { ValueReplacerHandler } from '@boart/core';
import { StoreReplacer } from '@boart/core-impl';

import BasicDataGroupDefinition from './src/basicGroup/BasicDataGroupDefinition';
import BasicGroupDefinition from './src/basicGroup/BasicGroupDefinition';
import RestCallTableHandler from './src/rest/RestCallTableHandler';

export { BasicDataGroupDefinition, BasicGroupDefinition, RestCallTableHandler };

/**
 *
 */
function initialize(): void {
    ValueReplacerHandler.instance.add('store', new StoreReplacer());
}

initialize();
