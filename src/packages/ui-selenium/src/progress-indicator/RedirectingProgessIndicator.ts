import { UIProgressIndicator } from '@boart/ui';
import { SeleniumDriverAdapter } from '../web-driver/SeleniumDriverAdapter';
import { CodeInjectorRedirecting } from '../code-injector/CodeInjectorRedirecting';

/**
 *
 */
export class RedirectingProgessIndicator implements UIProgressIndicator {
    /**
     *
     */
    public name = 'isRedirecting';

    /**
     *
     */
    private codeInjector: CodeInjectorRedirecting;

    /**
     *
     */
    public async isProcessing(driver: SeleniumDriverAdapter): Promise<boolean> {
        if (!this.codeInjector) {
            this.codeInjector = new CodeInjectorRedirecting(driver.nativeDriver);
        }

        await this.codeInjector.inject();
        return this.codeInjector.isRedirecting();
    }
}
