/**
 *
 */
export enum RuntimeStatus {
    failed,
    succeeded,
    notExecuted
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RuntimeStatus {
    export function status(isFailed: boolean): RuntimeStatus {
        if (isFailed === false) {
            return RuntimeStatus.failed;
        } else if (isFailed === true) {
            return RuntimeStatus.succeeded;
        } else {
            return RuntimeStatus.notExecuted;
        }
    }
}
