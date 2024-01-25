import { DescriptionExample } from './DescriptionExample';

export interface Description {
    readonly id: string;
    readonly parentId?: string;
    title?: string;
    readonly dataScopes?: ReadonlyArray<string>;
    readonly description: string;
    readonly examples: ReadonlyArray<DescriptionExample>;
}
