import { DescriptionCodeExample } from './DescriptionCodeExample';

/**
 *
 */
export interface DescriptionExample {
    readonly title: string;
    codes?: ReadonlyArray<DescriptionCodeExample>;
    example: string;
}
