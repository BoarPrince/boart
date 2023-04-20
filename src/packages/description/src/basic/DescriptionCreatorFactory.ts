import { FullDescription } from '@boart/core';
import * as nunjucks from 'nunjucks';

import { DescriptionCreator } from './DescriptionCreator';

/**
 *
 */
export interface DescriptionCreatorFactory {
    create(env: nunjucks.Environment, description: FullDescription): DescriptionCreator;
    readonly resourceName: string;
}
