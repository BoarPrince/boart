import { Description } from '@boart/core';

/**
 *
 */
export class ChildMap extends Map<string, Array<Description>> {
    /**
     *
     */
    public override get(parentId: string): Array<Description> {
        let childList = super.get(parentId);
        if (!childList) {
            childList = [];
            super.set(parentId, childList);
        }
        return childList;
    }
}
