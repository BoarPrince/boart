import { FetchOption } from './FetchOption';

/**
 *
 */

export interface Diagnostic {
    url: string;
    bearerJWT?: string;
    option: FetchOption;
}
