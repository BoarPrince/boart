import { DescriptionExample } from './DescriptionExample';

export interface Description {
    readonly id: string;
    readonly parentId?: string;
    title?: string;
    readonly dataScope?: string;
    readonly description: string;
    readonly examples: ReadonlyArray<DescriptionExample>;
}
