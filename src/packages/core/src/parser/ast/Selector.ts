import { SelectorType } from './SelectorType';

export interface Selector {
    type: SelectorType;
    value: string;
    index?: number;
    optional: boolean;
    start?: number;
    end?: number;
    indexes?: number[];
}
