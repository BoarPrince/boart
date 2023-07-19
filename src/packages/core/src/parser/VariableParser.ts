import * as parser from './ParserVariable.js';
import { ASTVariable } from './ast/ASTVariable';

/**
 *
 */
export class VariableParser {
    /**
     *
     */
    private getInnerMatch(value: string): { match: string; input: string } {
        const r = /\s*\$\s*\{(.+)}\s*/;
        const match = r.exec(value);
        return match ? this.getInnerMatch(match[1]) || { match: match[1], input: match[0] } : null;
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
            return {
                errs: {
                    message: e.message,
                    location: e.location
                }
            } as any;
        }
    }
}
