import { DescriptionCodeExample } from "./DescriptionCodeExample";

/**
 *
 */
export interface DescriptionExample {
    readonly title: string;
    code?: ReadonlyArray<DescriptionCodeExample>;
    example: string;
}
