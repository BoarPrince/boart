import { UIProgressIndicator } from '@boart/ui';
import { SeleniumDriverAdapter } from '../web-driver/SeleniumDriverAdapter';
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
    public async isProcessing(driver: SeleniumDriverAdapter): Promise<boolean> {
        if (!this.codeInjector) {
            this.codeInjector = new CodeInjectorRestLog(driver.nativeDriver);
        }

        await this.codeInjector.inject();
        return (await this.codeInjector.getCallLevel()) > 0;
    }
}
