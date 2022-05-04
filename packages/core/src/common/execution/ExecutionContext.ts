/**
 *
 */
export interface ExecutionContext<TConfig, TPreExecution, TExecution> {
    readonly config: TConfig;
    readonly preExecution: TPreExecution;
    readonly execution: TExecution;
}
