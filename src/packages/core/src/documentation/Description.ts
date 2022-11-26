export interface Description {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly examples: Array<DescriptionExample>;
}

export interface DescriptionExample {
    readonly title: string;
    readonly example: string;
}
