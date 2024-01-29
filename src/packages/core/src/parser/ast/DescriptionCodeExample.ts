import { DescriptionCodeExamplePosition, DescriptionCodeExampleType } from '../../description/DescriptionCodeExample';
import { Location } from './Location';

/**
 *
 */
export interface DescriptionCodeExample {
    title: string;
    type: DescriptionCodeExampleType;
    position: DescriptionCodeExamplePosition;
    code: ReadonlyArray<string>;
    location: Location;
}
