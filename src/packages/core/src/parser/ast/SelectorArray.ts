import { Selector } from './Selector';

/**
 *
 */
export interface SelectorArray extends Array<Selector> {
    match?: string;
}
