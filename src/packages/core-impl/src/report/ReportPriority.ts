/**
 *
 */
export enum ReportPriority {
    high,
    medium,
    low
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ReportPriority {
    export function priority(priority: string): ReportPriority {
        if (priority.toLowerCase() === 'low') {
            return ReportPriority.low;
        } else if (priority.toLowerCase() === 'high') {
            return ReportPriority.high;
        } else {
            return ReportPriority.medium;
        }
    }
}
