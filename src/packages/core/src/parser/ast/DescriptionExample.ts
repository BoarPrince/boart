import { DescriptionCodeExample } from "./DescriptionCodeExample";
import { Location } from "./Location";

/**
 *
 */
export interface DescriptionExample {
    title: string;
    codes?: Array<DescriptionCodeExample>;
    text: Array<string>;
    location: Location;
}
