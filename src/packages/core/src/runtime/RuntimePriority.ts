/**
 *
 */
export enum RuntimePriority {
    high,
    medium,
    low
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RuntimePriority {
    export function priority(priority: string): RuntimePriority {
        if (priority.toLowerCase() === 'low') {
            return RuntimePriority.low;
        } else if (priority.toLowerCase() === 'high') {
            return RuntimePriority.high;
        } else {
            return RuntimePriority.medium;
        }
    }
}
