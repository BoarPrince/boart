import { DescriptionExample } from "./DescriptionExample";
import { Location } from "./Location";


/**
 *
 */
export interface ASTDescription {
  id: string;
  // readonly parentId?: string;
  title?: string;
  desc: ReadonlyArray<string>;
  examples: ReadonlyArray<DescriptionExample>;
  location: Location;
}

/**
 *
 */
export interface ASTUnitDescription {
  unit: string;
  // readonly parentId?: string;
  desc: ASTDescription;
}
