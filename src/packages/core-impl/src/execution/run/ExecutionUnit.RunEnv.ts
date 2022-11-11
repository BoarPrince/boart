import { EnvLoader, ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

/**
 *
 */
export class RunEnvExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = 'run:env';
    readonly parameterType = ParaType.False;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        const environments = (row.value.toString() || '')
            .toString()
            .split(/[,\s]/)
            .filter((e) => !!e);

        const actualEnv = EnvLoader.instance.getEnvironment();
        if (!environments.includes(actualEnv)) {
            Runtime.instance.stepRuntime.current.status = RuntimeStatus.stopped;
        }
    }
}
