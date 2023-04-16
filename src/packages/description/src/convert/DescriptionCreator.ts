import { ChildMap } from '../util/ChildMap';

import { DescriptionLinkReference } from './DescriptionLinkReference';

/**
 *
 */
export interface DescriptionCreator {
    create(templateName: string): string;
    addLinkReference(fileName: string, linkReferenceMap: Map<string, DescriptionLinkReference>): void;
    populateChildMap(childMap: ChildMap): void;
}
