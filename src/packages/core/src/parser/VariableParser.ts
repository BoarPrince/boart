import * as variableParser from './peggy/ParserVariable.js';
import * as actionParser from './peggy/ParserAction.js';
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
        return match
            ? this.getInnerMatch(match[1]) || {
                  match: match[1],
                  input: match[0]
              }
            : null;
    }

    /**
     *
     */
    public getValueWithStartMarker(location: Location, match: string): string {
        const start = location.start.column + 1;
        const end = location.end.column + 1;
        const first = match.slice(0, start);
        const second = match.slice(start, end);
        return `${first} -> ${second}`;
    }

    /**
     *
     */
    public getValueWithMarker(location: Location, match: string): string {
        const start = location.start.column + 1;
        const end = location.end.column + 1;
        const first = match.slice(0, start);
        const second = match.slice(start, end);
        const third = match.slice(end);
        return `${first} -> ${second} <- ${third}`;
    }

    /**
     *
     */
    public parseVariable(value: string): ASTVariable {
        const match = this.getInnerMatch(value);
        if (!match) {
            return null;
        }
        try {
            const result = variableParser.parse(match.match);
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

    /**
     *
     */
    public parseAction(value: string): ASTVariable {
        try {
            const result = actionParser.parse(value);
            return {
                ...result,
                match: value,
                errs: result.errs || null
            };
        } catch (e) {
            const valueWithErrorMarker = this.getValueWithMarker(e.location, value);
            throw new Error(`${e.message}\n${valueWithErrorMarker}`);
        }
    }
}
