import { SeleniumElementProxy } from '../element-proxy/SeleniumElementProxy';
import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';

/**
 *
 */
export class ByText extends BaseLocator {
    public readonly strategyCanBeNull = false;
    public readonly strategy = 'text';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public find(locationByStrategy: string, parentElement: SeleniumElementProxy): Promise<WebElement[]> {
        throw new Error('not implemented');
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findAll(parentElement: SeleniumElementProxy): Promise<WebElement[]> {
        throw new Error('not implemented');
    }
}
