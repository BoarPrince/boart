import { DescriptionExample } from './DescriptionExample';
import { Location } from './Location';

/**
 *
 */
export interface ASTDescription {
    id: string;
    // readonly parentId?: string;
    title: string;
    titleShort: string;
    desc: Array<string>;
    examples: Array<DescriptionExample>;
    location: Location;
}

/**
 *
 */
export interface ASTUnitDescription {
    unit: string;
    // readonly parentId?: string;
    desc: ASTDescription;
}
