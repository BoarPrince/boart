import { DataItem } from './DataItem';

/**
 *
 */

export interface StepItem {
    id: string;
    status: string;
    errorMessage: string;
    duration: number;
    startTime: string;
    type: string;
    group: string;
    description: string;
    detailDescription: string[];
    steps: Array<StepItem>;
    input: Array<DataItem>;
    output: Array<DataItem>;
}
