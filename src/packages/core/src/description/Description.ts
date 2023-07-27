export interface Description {
    readonly id: string;
    readonly parentId?: string;
    title?: string;
    readonly description: string;
    readonly examples: ReadonlyArray<DescriptionExample>;
}

export interface DescriptionExample {
    readonly title: string;
    example: string;
}
