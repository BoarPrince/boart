import { ErrorLocation } from './ErrorLocation';

export interface Error {
    message: string;
    location: ErrorLocation;
}
