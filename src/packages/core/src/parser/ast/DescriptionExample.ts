import { DescriptionCodeExample } from "./DescriptionCodeExample";
import { Location } from "./Location";

/**
 *
 */
export interface DescriptionExample {
    title: string;
    codes?: ReadonlyArray<DescriptionCodeExample>;
    text: ReadonlyArray<string>;
    location: Location;
}
