/**
 *
 */
export interface ExecutionContext<TConfig, TPreExecution, TExecution> {
    config: TConfig;
    preExecution: TPreExecution;
    execution: TExecution;
}
