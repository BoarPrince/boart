import { DefaultRowType, EnvLoader, ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class RunEnvExecutionUnit implements ExecutionUnit<AnyContext, DefaultRowType<AnyContext>> {
    readonly key = Symbol('run:env');
    readonly description = () => ({
        id: '53d3ce49-f88d-40a2-99d5-06553535136c',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: DefaultRowType<AnyContext>): void {
        const environments = (row.value.toString() || '')
            .toString()
            .split(/[,\s]/)
            .filter((e) => !!e);

        const actualEnv = EnvLoader.instance.getEnvironment();
        if (!environments.includes(actualEnv)) {
            Runtime.instance.stepRuntime.currentContext.status = RuntimeStatus.stopped;
        }
    }
}
