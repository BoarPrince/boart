export interface Description {
    readonly id: string;
    title: string;
    readonly description: string;
    readonly examples: ReadonlyArray<DescriptionExample>;
}

export interface DescriptionExample {
    readonly title: string;
    example: string;
}
