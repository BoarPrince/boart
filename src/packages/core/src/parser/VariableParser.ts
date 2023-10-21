import { ASTAction } from './ast/ASTAction';
import { ASTVariable } from './ast/ASTVariable';
import { Location } from './ast/Location';
import * as actionParser from './peggy/ParserAction.js';
import * as variableParser from './peggy/ParserVariable.js';

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
    private addStringValueAccessor<T extends ASTVariable | ASTAction>(ast: T): T {
        if (ast.selectors?.match) {
            ast.selectors.match = ast.selectors.match.replace(/^[?]?#/, '');
        }

        if (ast.qualifier) {
            ast.qualifier.stringValue = [ast.qualifier.value].concat(ast.qualifier.paras ?? []).join(':');
            ast.name.stringValue = ast.name.value + ':' + ast.qualifier.stringValue;
        } else {
            ast.name.stringValue = ast.name.value;
        }

        return ast;
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
        if (!location) {
            return '';
        }
        const start = location.start.column + 1;
        const end = location.end.column + 1;
        const first = match.slice(0, start);
        const second = match.slice(start, end);
        const third = match.slice(end);
        return `${first} -> ${second} <- ${third}`;
    }

    /**
     * V A R I A B L E
     */
    public parseVariable(value: string): ASTVariable {
        const match = this.getInnerMatch(value);
        if (!match) {
            return null;
        }
        try {
            const result = variableParser.parse(match.match);
            return this.addStringValueAccessor({
                ...result,
                match: match.input,
                errs: result.errs || null
            });
        } catch (e) {
            const valueWithErrorMarker = this.getValueWithMarker(e.location, match.input);
            throw new Error(`${e.message || ''}\n${valueWithErrorMarker}`);
        }
    }

    /**
     * A C T I O N
     */
    public parseAction(value: string): ASTAction {
        try {
            const result = actionParser.parse(value);
            return this.addStringValueAccessor({
                ...result,
                match: value,
                errs: result.errs || null
            });
        } catch (e) {
            const valueWithErrorMarker = this.getValueWithMarker(e.location, value);
            throw new Error(`${e.message}\n${valueWithErrorMarker}`);
        }
    }
}
