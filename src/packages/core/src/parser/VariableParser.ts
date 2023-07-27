import * as parser from './peggy/ParserVariable.js';
import { ASTVariable } from './ast/ASTVariable';
import { Location } from './ast/Location.js';

/**
 *
 */
export class VariableParser {
    /**
     *
     */
    private getInnerMatch(value: string): { match: string; input: string } {
        // "\\"" and "\$"" must be escaped. The underlying parser is unescaping again after parsing
        value = value?.replace(/[\\][\\]/, '\\\x01')?.replace(/[\\][$]/, '\\\x02');

        const r = /\s*\$\s*\{(.+)}\s*/;
        const match = r.exec(value);
        return match ? this.getInnerMatch(match[1]) || { 
            match: match[1], 
            input: match[0] 
        } : null;
    }

    /**
     * 
     */
    public getValueWithMarker(location: Location, match: string): string {
        const start = location.start.column + 1;
        const end = location.end.column +1 ;
        const first = match.slice(0, start);
        const second = match.slice(start, end);
        const third = match.slice(end);
        return `${first} -> ${second} <- ${third}`;
    }

    /**
     *
     */
    public parse(value: string): ASTVariable {
        const match = this.getInnerMatch(value);
        if (!match) {
            return null;
        }
        try {
            const result = parser.parse(match.match);
            return {
                ...result,
                match: match.input,
                errs: result.errs || null
            };
        } catch (e) {
            const valueWithErrorMarker = this.getValueWithMarker(e.location, match.input);
            throw new Error(`${e.message}\n${valueWithErrorMarker}`);
        }
    }
}
