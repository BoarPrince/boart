import { DataItem } from './DataItem';

/**
 *
 */

export interface StepItem {
    id: string;
    status: string;
    errorMessage: string;
    duration: string;
    startTime: string;
    type: string;
    description: string;
    input: Array<DataItem>;
    output: Array<DataItem>;
}
