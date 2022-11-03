import { BaseRowMetaDefinition } from '../table/BaseRowMetaDefinition';

/**
 *
 */
export interface RowValidator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>, rows: readonly BaseRowMetaDefinition<any, any>[]): void;
}
