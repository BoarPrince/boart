import { WebDriver } from 'selenium-webdriver';
import { BoartInjectorInstance } from './BoartInjectorInstance';

/**
 *
 */
export class CodeInjectorRedirecting {
    /**
     *
     */
    constructor(private driver: WebDriver) {}

    /**
     *
     */
    public isRedirecting(): Promise<boolean> {
        return this.driver.executeScript(() => globalThis.boart?.isRedirecting ?? true);
    }

    /**
     *
     */
    public async inject(): Promise<void> {
        await this.driver.executeScript(() => {
            /**
             * Globals
             */
            let boart: BoartInjectorInstance;
            if (!globalThis.boart?.isRedirecting == null) {
                boart = {
                    isRedirecting: false
                };
                globalThis.boart = boart;
                // wait one seconds when a page is loaded
                setTimeout(() => boart.call_level--, 1000);
            } else {
                return;
            }

            /**
             * Check Redirecting
             */
            window.addEventListener('beforeunload', () => {
                boart.isRedirecting = true;
            });

            window.addEventListener('unload', () => {
                boart.isRedirecting = false;
            });

            // eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
            const origPushState = window.history.pushState;
            window.history.pushState = function (state: string, title: string, url: string): string {
                const self = this as History;
                boart.isRedirecting = true;
                setTimeout(() => {
                    boart.isRedirecting = false;
                }, 500);

                // console.log(
                //     '######### call pushState (router.navigateByUrl)',
                //     new Date(),
                //     JSON.stringify({
                //         state,
                //         title,
                //         url
                //     })
                // );
                const pushStateResult = origPushState.apply(self, [state, title, url]) as string;
                return pushStateResult;
            };

            /**
             * Trace Redirects (finish redirect)
             */
            // eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
            const origReplaceState = window.history.replaceState;
            window.history.replaceState = function (state: string, title: string, url: string): string {
                // console.redirectEnd('replaceState');
                // console.log(
                //     '######### call replaceState ',
                //     JSON.stringify({
                //         state,
                //         title,
                //         url
                //     })
                // );
                const replaceStateResult = origReplaceState.apply(this, [state, title, url]) as string;
                return replaceStateResult;
            };
        });
        // https://stackoverflow.com/questions/50020102/java-selenium-with-angular-5
    }
}
