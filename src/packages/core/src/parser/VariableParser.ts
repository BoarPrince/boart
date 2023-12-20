import { ASTAction } from './ast/ASTAction';
import { ASTValue } from './ast/ASTValue';
import { ASTVariable } from './ast/ASTVariable';
import { Location } from './ast/Location';
import * as actionParser from './peggy/ParserAction.js';
import * as valueParser from './peggy/ParserValue.js';
import * as variableParser from './peggy/ParserVariable.js';

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
export class VariableParser {
    /**
     *
     */
    private getInnerMatch(value: string): { match: string; input: string } {
        const r = /\s*\$\s*\{(.+)\}\s*/;
        const match = r.exec(value);
        return match
            ? {
                  match: match[1],
                  input: match[0]
              }
            : null;
    }

    /**
     *
     */
    private addStringValueAccessor<T extends ASTVariable | ASTAction | ASTValue>(ast: T): T {
        if (ast.selectors?.match) {
            ast.selectors.match = ast.selectors.match.replace(/^[?]?#/, '');
        }

        if (ast.qualifier) {
            ast.qualifier.stringValue = [ast.qualifier.value].concat(ast.qualifier.paras ?? []).join(':');
            ast.qualifier.selectorMatch = [ast.qualifier.stringValue].concat(ast.selectors?.match ?? []).join('#');
        } else {
            ast.name.stringValue = ast.name.value;
        }

        if (ast.name && ast.qualifier) {
            ast.name.stringValue = ast.name.value + ':' + ast.qualifier.stringValue;
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
            const result = variableParser.parse(match.match) as ASTVariable;
            return this.addStringValueAccessor({
                ...result,
                match: match.input,
                errs: (result as any).errs || null
            });
        } catch (e) {
            const error = e as ParserException;
            // const valueWithErrorMarker = this.getValueWithMarker(error.location, match.input);
            const valueWithErrorMarker = this.getValueWithMarker(error.location, value);
            throw new Error(`${error.message || ''}\n${valueWithErrorMarker}`);
        }
    }

    /**
     * A C T I O N
     */
    public parseAction(value: string): ASTAction {
        try {
            const result = actionParser.parse(value) as ASTAction;
            return this.addStringValueAccessor({
                ...result,
                match: value,
                errs: (result as any).errs || null
            });
        } catch (e) {
            const error = e as ParserException;
            const valueWithErrorMarker = this.getValueWithMarker(error.location, value);
            throw new Error(`${error.message}\n${valueWithErrorMarker}`);
        }
    }

    /**
     * V A L U E
     */
    public parseValue(value: string): ASTValue {
        try {
            const result = valueParser.parse(value) as ASTValue;
            return this.addStringValueAccessor({
                ...result,
                match: value,
                errs: (result as any).errs || null
            });
        } catch (e) {
            const error = e as ParserException;
            const valueWithErrorMarker = this.getValueWithMarker(error.location, value);
            throw new Error(`${error.message}\n${valueWithErrorMarker}`);
        }
    }
}
