import { JsonLogic } from './JsonLogic';
import { JsonLogicOperator } from './JsonLogicOperator';

/**
 *
 */
export function JsonLogicOperatorInitializer<T extends { new (): JsonLogicOperator }>(constructor: T) {
    const operator = new constructor();
    JsonLogic.instance.addOperator(operator);
}
