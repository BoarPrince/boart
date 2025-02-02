import { ElementAdapter } from '@boart/ui';
import { SeleniumElementAdapter } from '../element-adapter/SeleniumElementAdapter';
import { DivProxy } from './DivProxy';
import { DescriptionHandler } from '@boart/core';

/**
 *
 */
export class AnyProxy extends DivProxy {
    public readonly name = 'any';
    public readonly tagName = '*';
    public readonly order = 0;

    /**
     *
     */
    public async getElementByMatchingText(text: string, parentElement: SeleniumElementAdapter): Promise<ElementAdapter> {
        const xPaths = [`.//*[text()[normalize-space() = "${text}"]]`];
        return await SeleniumElementAdapter.getElement(xPaths, parentElement);
    }

    /**
     *
     */
    public description = () => DescriptionHandler.readDescription(__filename);
}
