/**
 *
 */
export class Property {
    readonly key: string;
    readonly isArrayIndex: boolean = false;
    readonly isOptional: boolean = false;

    /**
     *
     */
    constructor(key: string, public readonly path: string) {
        if (key?.endsWith('?')) {
            this.isOptional = true;
            this.key = key.slice(0, -1);
        } else {
            this.key = key;
        }

        this.isArrayIndex = !isNaN(Number(this.key));
    }
}
