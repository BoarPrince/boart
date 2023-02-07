import { ExpectedDescription } from './ExpectedDescription';
import { TableHandlerDescription } from './TableHandlerDescription';
import { ValueReplacerDescription } from './ValueReplacerDescription';

/**
 *
 */
export interface FullDescription {
    tableHandlers: ReadonlyArray<TableHandlerDescription>;
    expected: ExpectedDescription;
    replacer: ValueReplacerDescription;
}
