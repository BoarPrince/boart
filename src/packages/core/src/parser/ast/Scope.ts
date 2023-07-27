import { ScopeType } from 'core/src/types/ScopeType';
import { Location } from './Location';

/**
 * 
 */
export interface Scope {
    value: ScopeType;
    location: Location;
}
