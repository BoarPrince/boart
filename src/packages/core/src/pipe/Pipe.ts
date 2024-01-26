import { ParaDescription } from './ParaDescription';

/**
 *
 */
export interface Pipe {
    name: string;
    paraDesc?: ParaDescription[];
    run(value: string, ...args: Array<string | number | boolean>): string;
}
