import { Description } from './Description';

/**
 *
 */
export interface Descriptionable {
    description?: () => Description;
}
