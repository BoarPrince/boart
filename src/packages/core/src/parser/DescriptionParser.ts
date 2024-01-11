import { ASTDescription, ASTUnitDescription } from './ast/ASTDescription';
import { Location } from './ast/Location';
import * as descriptionParser from './peggy/ParserDescription.js';

/**
 *
 */
class ParserException {
    message: string;
    location: Location;
}
/**
 *
 */
export class DescriptionParser {

    /**
     *
     */
    private getValueWithLocationMarker(location: Location, match: string): string {
        if (!location) {
            return '';
        }
        const start = location.start.offset + 1;
        const end = location.end.offset + 1;
        const first = match.slice(0, start);
        const third = match.slice(end);
        return `${first} ->>> ${third}`;
    }

    /**
     *
     */
    public parse(value: string): ASTDescription | ReadonlyArray<ASTUnitDescription> {
        if (!value) {
          throw new Error('description cannot be empty');
        }

        try {
            const valueWithEndingNewLine = value.endsWith('\n') ? value : value.concat('\n');
            return descriptionParser.parse(valueWithEndingNewLine) as ASTDescription | ReadonlyArray<ASTUnitDescription>;
        } catch (e) {
            const error = e as ParserException;
            const valueWithErrorMarker = this.getValueWithLocationMarker(error.location, value);
            throw new Error(`${error.message || ''}\n${valueWithErrorMarker}`);
        }
    }
}
