/**
 *
 */
export interface Generator {
    readonly name: string;
    generate(...parameters: readonly string[]): string;
}
