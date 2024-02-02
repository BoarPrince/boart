import { DefaultRowType, ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { UniqueValidator } from '../../validators/UniqueValidator';

import { RunDefinitionParser } from './RunDefinitionParser';

/**
 *
 */
export class RunNotExecutionUnit implements ExecutionUnit<AnyContext, DefaultRowType<AnyContext>> {
    readonly key = Symbol('run:not');
    readonly description = () => ({
        id: '74239545-52a2-433f-b735-7e60646181f8',
        description: null,
        examples: null
    });
    readonly parameterType = ParaType.True;
    readonly validators = [new UniqueValidator()];

    /**
     *
     */
    execute(_: AnyContext, row: DefaultRowType<AnyContext>): void {
        const runDefinition = RunDefinitionParser.parse(row.value.toString());
        const name = row.ast.qualifier?.paras?.join(':');

        const matchedDefinition = runDefinition.find((def) => def.name === name);
        if (!!matchedDefinition) {
            Runtime.instance.stepRuntime.currentContext.status = RuntimeStatus.stopped;
        }
    }
}
