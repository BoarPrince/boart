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
        if (isFailed === true) {
            return RuntimeStatus.failed;
        } else if (isFailed === false) {
            return RuntimeStatus.succeeded;
        } else {
            return RuntimeStatus.notExecuted;
        }
    }
}
