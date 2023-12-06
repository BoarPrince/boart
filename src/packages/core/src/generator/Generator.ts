/**
 *
 */
export interface Generator {
    readonly name: string;
    generate(paras: string[]): string;
}
