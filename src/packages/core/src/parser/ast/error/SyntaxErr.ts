import { MatchAttempt } from './MatchAttempt';
import { PosInfo } from './PosInfo';

/**
 *
 */
export class SyntaxErr {
    public pos: PosInfo;
    public expmatches: MatchAttempt[];
    constructor(pos: PosInfo, expmatches: MatchAttempt[]) {
        this.pos = pos;
        this.expmatches = [...expmatches];
    }
    public toString(): string {
        return `Syntax Error at line ${this.pos.line}:${this.pos.offset}. Expected one of ${this.expmatches.map((x) =>
            x.kind === 'EOF' ? ' EOF' : ` ${x.negated ? 'not ' : ''}'${x.literal}'`
        )}`;
    }
}
