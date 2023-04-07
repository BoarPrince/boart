import { ContentType } from '../data/ContentType';

import { LogProvider } from './LogProvider';
import { Logger } from './Logger';

/**
 *
 */
export class LoggerImpl implements Logger {
    /**
     *
     */
    private constructor(private name: string) {}

    /**
     *
     */
    static createLogger(provider: LogProvider, name: string): Logger {
        return new LoggerImpl(`${provider.name}.${name}`);
    }

    /**
     *
     */
    public childLogger(name: string): Logger {
        return new LoggerImpl(`${this.name}.${name}`);
    }

    /**
     *
     */
    public info(log: () => string, detail: () => ContentType = null, highlight = false) {
        const highlighter = () => {
            if (highlight === true) {
                console.log('***********************************************************************************');
            }
        };

        if (!!detail) {
            highlighter();
            console.log(this.name, log(), JSON.stringify(detail()));
            highlighter();
        } else {
            highlighter();
            console.log(this.name, log());
            highlighter();
        }
    }

    /**
     *
     */
    public warn(log: () => string) {
        log();
    }

    /**
     *
     */
    public debug(log: () => string, detail: () => ContentType = null) {
        if (!!detail) {
            console.log(this.name, log(), JSON.stringify(detail()));
        } else {
            console.log(this.name, log());
        }
    }

    /**
     *
     */
    public trace(log: () => string, detail: () => ContentType = null) {
        if (!!detail) {
            console.log(this.name, log(), JSON.stringify(detail()));
        } else {
            console.log(this.name, log());
        }
    }
}
