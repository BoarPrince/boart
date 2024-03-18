import { WebPageAdapterScreenshot } from '@boart/ui';
import { SeleniumWebPageAdapter } from './SeleniumWebPageAdapter';
import { WebDriver } from 'selenium-webdriver';
import fs from 'fs';
import { randomUUID } from 'crypto';

export class SeleniumWebPageAdapterScreenshot implements WebPageAdapterScreenshot<WebDriver> {
    /**
     *
     */
    constructor(public readonly webDriverAdapter: SeleniumWebPageAdapter) {}

    /**
     *
     */
    enable(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    disable(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    getFileName(): string {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    async take(filename: string): Promise<string> {
        const base64PNG = await this.webDriverAdapter.driver.nativeDriver.takeScreenshot();
        const buff = Buffer.from(base64PNG, 'base64');

        filename = filename ?? randomUUID();
        filename = filename.endsWith('.png') ? filename : filename + '.png';

        fs.writeFileSync(filename, buff);
        return filename;
    }
}
