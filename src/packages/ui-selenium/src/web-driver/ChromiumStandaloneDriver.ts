import chrome from 'selenium-webdriver/chrome';
import { Browser, Builder, Capabilities, WebDriver, logging } from 'selenium-webdriver';

/**
 *
 */
export class ChromiumStandaloneDriver {
    /**
     *
     */
    create(): Promise<WebDriver> {
        const options = new chrome.Options() //
            .addArguments('--disable-web-security')
            .addArguments('--ignore-certificate-errors')
            .addArguments('--allow-running-insecure-content')
            .addArguments('--disable-gpu')
            .addArguments('--no-sandbox')
            // .addArguments('--no-first-run')
            .addArguments('--disable-infobars')
            .addArguments('--disable-dev-shm-usage')
            .addArguments('--start-maximized')
            .addArguments('--headless')
            .setUserPreferences({ 'download.default_directory': './downloads' });

        options.setAcceptInsecureCerts(true);

        const prefs = new logging.Preferences();
        prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

        const caps = Capabilities.chrome();
        caps.setLoggingPrefs(prefs);

        // const sizeX = EnvLoader.get('screen_width') - 10;
        // const sizeY = EnvLoader.get('screen_height') - 10;
        // options.addArguments(`--window-size=${sizeX},${sizeY}`);

        // check headless
        // if (EnvLoader.get('headless') == 'true') {
        // options.headless();
        // }

        // if (EnvLoader.get('open_devtools') == 'true') {
        //     options.addArguments('--auto-open-devtools-for-tabs');
        //     options.addArguments('-fullscreen');
        // }

        const driver = async () =>
            new Builder() //
                .withCapabilities(caps) //
                .forBrowser(Browser.CHROME) //
                .setChromeOptions(options) //
                .build();

        return driver();
    }
}
