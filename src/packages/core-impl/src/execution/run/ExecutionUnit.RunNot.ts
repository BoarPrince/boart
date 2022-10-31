import { ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

import { RunDefinitionParser } from './RunDefinitionParser';

/**
 *
 */
export class RunNotExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = 'run:not';
    readonly parameterType = ParaType.True;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: RowTypeValue<AnyContext>): void {
        const runDefinition = RunDefinitionParser.parse(row.value.toString());
        const name = row.actionPara;

        const matchedDefinition = runDefinition.find((def) => def.name === name);
        if (!!matchedDefinition) {
            Runtime.instance.stepRuntime.current.status = RuntimeStatus.stopped;
        }
    }
}
