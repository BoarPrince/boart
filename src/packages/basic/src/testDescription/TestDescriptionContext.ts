import { ExecutionContext } from '@boart/core';

/**
 *
 */
export interface TestDescriptionConfigContext {
    ticket: string;
    description: string;
    failureDescription: string;
    priority: string;
}

/**
 *
 */
export type TestDescriptionContext = ExecutionContext<TestDescriptionConfigContext, null, null>;
