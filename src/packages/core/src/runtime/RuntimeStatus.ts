/**
 *
 */
export enum RuntimeStatus {
    failed,
    succeed,
    notExecuted,
    stopped
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RuntimeStatus {
    export function status(isFailed: boolean): RuntimeStatus {
        if (isFailed === true) {
            return RuntimeStatus.failed;
        } else if (isFailed === false) {
            return RuntimeStatus.succeed;
        } else {
            return RuntimeStatus.notExecuted;
        }
    }
}
