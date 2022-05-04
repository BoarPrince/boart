/**
 *
 */
export interface JsonLogicOperator {
    readonly name: string | ReadonlyArray<string>;
    /**
     *
     */
    execute(...args: readonly unknown[]): unknown;
}
