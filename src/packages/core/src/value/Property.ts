/**
 *
 */
export class Property {
    readonly key: string;
    readonly isArrayIndex: boolean = false;
    readonly isArrayDefinition: boolean = false;
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

        this.isArrayDefinition = this.key === '*' ? true : false;
        this.isArrayIndex = !isNaN(Number(this.key));
    }
}
