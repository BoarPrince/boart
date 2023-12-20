import { OperatorType } from '../../value/OperatorType';

import { Location } from './Location';

/**
 *
 */
export interface DefaultOperator {
    value: string;
    operator: OperatorType;
    location: Location;
}
