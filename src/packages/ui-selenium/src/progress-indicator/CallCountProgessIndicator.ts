import { UIProgressIndicator } from '@boart/ui';
import { SeleniumWebDriver } from '../web-driver-adapter/SeleniumWebDriver';
import { CodeInjectorRestLog } from '../code-injector/CodeInjectorRestLog';

/**
 *
 */
export class CallCountProgessIndicator implements UIProgressIndicator {
    /**
     *
     */
    public name = 'callCount';

    /**
     *
     */
    private codeInjector: CodeInjectorRestLog;

    /**
     *
     */
    public async isProcessing(driver: SeleniumWebDriver): Promise<boolean> {
        if (!this.codeInjector) {
            this.codeInjector = new CodeInjectorRestLog(driver.nativeDriver);
        }

        await this.codeInjector.inject();
        return (await this.codeInjector.getCallLevel()) > 0;
    }
}
