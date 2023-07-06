import { parse } from './ParserVariable.peg';
import { ASTVariable } from './ast/ASTVariable';

/**
 *
 */
export class VariableParser {
    /**
     *
     */
    public parse(value: string): ASTVariable {
        const r = /\$\{[^{}]+}/;
        const match = r.exec(value);
        return <ASTVariable>parse(match && match[0]);
    }
}
