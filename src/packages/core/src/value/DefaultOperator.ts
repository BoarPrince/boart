import { OperatorType } from './OperatorType';

/**
 *
 */

export class DefaultOperator {
    public readonly type: OperatorType;

    /**
     *
     */
    constructor(public readonly value: string) {
        switch (value) {
            case '':
            case undefined:
            case null:
                this.type = OperatorType.None;
                break;
            case ':-':
                this.type = OperatorType.Default;
                break;
            case ':=':
                this.type = OperatorType.DefaultAssignment;
                break;
            default:
                this.type = OperatorType.Unknown;
        }
    }
}
