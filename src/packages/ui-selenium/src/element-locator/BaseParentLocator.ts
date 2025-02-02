import { WebElement } from 'selenium-webdriver';
import { BaseLocator } from './BaseLocator';
import { ById } from './ById';
import { SeleniumElementLocatorAdapter } from '../element-adapter/SeleniumElementLocatorAdapter';

export abstract class BaseParentLocator extends BaseLocator {
    abstract readonly strategy;
    abstract strategyCanBeNull: boolean;

    /**
     *
     */
    abstract findChild(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]>;

    /**
     *
     */
    public async find(locationByStrategy: string, parentElement: SeleniumElementLocatorAdapter): Promise<WebElement[]> {
        // check by parent
        if (locationByStrategy.includes('#')) {
            const [parentId, location] = locationByStrategy.split('#');
            parentElement = await new ById().findBy(parentId, parentElement);
            locationByStrategy = location;
        }

        return this.findChild(locationByStrategy, parentElement);
    }
}
