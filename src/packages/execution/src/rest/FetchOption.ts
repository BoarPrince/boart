/**
 *
 */

export interface FetchOption {
    url: string;
    headers: {
        Authorization: string;
    };
    body: string;
    agent: object;
}
