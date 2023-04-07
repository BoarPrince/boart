import { Logger } from './Logger';

/**
 *
 */
export class NoLogger implements Logger {
    /**
     *
     */
    public childLogger = (): Logger => this;

    /**
     *
     */
    public info = () => null;

    /**
     *
     */
    public warn = () => null;

    /**
     *
     */
    public debug = () => null;

    /**
     *
     */
    public trace = () => null;
}
