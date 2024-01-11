/**
 *
 */

import { Location } from "./Location";

export interface DescriptionCodeExample {
  title: string;
  type: string;
  position: string;
  code: ReadonlyArray<string>;
  location: Location;
}
