import { ContentType } from '../data/ContentType';

/**
 *
 */
export interface Logger {
    /**
     *
     */
    childLogger(name: string): Logger;

    /**
     *
     */
    info(log: () => string);
    info(log: () => string, detail: () => ContentType);
    info(log: () => string, detail: () => ContentType, highlight: boolean);

    /**
     *
     */
    warn(log: () => string);

    /**
     *
     */
    debug(log: () => string);
    debug(log: () => string, detail: () => ContentType);

    /**
     *
     */
    trace(log: () => string);
    trace(log: () => string, detail: () => ContentType);
}
