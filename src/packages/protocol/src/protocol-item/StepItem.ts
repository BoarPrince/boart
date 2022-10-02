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
    description: string;
    detailDescription: string[];
    input: Array<DataItem>;
    output: Array<DataItem>;
}
