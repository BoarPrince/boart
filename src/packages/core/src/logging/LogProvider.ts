import { EnvLoader } from '../common/EnvLoader';
import { LogLevel } from '../types/LogLevel';
import { Logger } from './Logger';
import { LoggerImpl } from './LoggerImpl';
import { NoLogger } from './NoLogger';

/**
 *
 */
export class LogProvider {
    /**
     *
     */
    public get name(): string {
        return this._name;
    }

    /**
     *
     */
    private constructor(private _name: string) {
        // singleton
    }

    /**
     *
     */
    public static create(name: string): LogProvider {
        return new LogProvider(name);
    }

    /**
     *
     */
    public logger(name: string): Logger {
        // if (EnvLoader.instance.getLogLevel() === LogLevel.None) {
        return new NoLogger();
        // } else {
        //     return LoggerImpl.createLogger(this, name);
        // }
    }
}
