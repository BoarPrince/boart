import { DataContent } from '../data/DataContent';
import { ContextType } from '../types/ContextType';

/**
 *
 */
export interface StreamingContextData<DataType> {
    readonly type: ContextType;
    readonly action: string;
    readonly property?: string;
    readonly value: string;
    readonly boolContext: DataType;
    readonly startContext: DataType;
    readonly processContext: DataType;
    readonly transformedData: DataContent;
    readonly evaluatedData: DataContent;
    readonly inputData: DataContent;
}
