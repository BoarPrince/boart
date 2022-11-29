import { ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

import { RunDefinitionParser } from './RunDefinitionParser';

/**
 *
 */
export class RunNotExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = {
        id: '74239545-52a2-433f-b735-7e60646181f8',
        title: 'run:not',
        description: null,
        examples: null
    };
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
