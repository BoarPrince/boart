import { UIProgressIndicator } from '@boart/ui';
import { SeleniumDriverAdapter } from '../web-driver/SeleniumDriverAdapter';
import { CodeInjectorRedirecting } from '../code-injector/CodeInjectorRedirecting';

/**
 *
 */
export class AngularProgessIndicator implements UIProgressIndicator {
    /**
     *
     */
    public name = 'angular-ready';

    /**
     *
     */
    private codeInjector: CodeInjectorRedirecting;

    /**
     *
     */
    public async isProcessing(driver: SeleniumDriverAdapter): Promise<boolean> {
        const angularReady = await driver.nativeDriver.executeScript(async () => {
            if (!globalThis.getAllAngularTestabilities) {
                return false;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return await globalThis
                .getAllAngularTestabilities() //
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                .reduce(async (len, testability) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                    await testability.whenStable(() => len--);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return len;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                }, globalThis.getAllAngularTestabilities().length);
        });

        return angularReady !== 0;
    }
}
