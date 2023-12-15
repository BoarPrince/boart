import { ExecutionUnit, ParaType, Runtime, RuntimeStatus } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';
import { UniqueValidator } from '../../validators/UniqueValidator';

import { RunDefinitionParser } from './RunDefinitionParser';

/**
 *
 */
export class RunOnlyExecutionUnit implements ExecutionUnit<AnyContext, RowTypeValue<AnyContext>> {
    readonly description = {
        id: '44308180-99d2-46fd-a19d-476ebf8ae150',
        title: 'run:only',
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
        const name = row.ast.qualifier?.paras?.join('.');

        const matchedDefinition = runDefinition.find((def) => def.name === name);
        if (!matchedDefinition) {
            Runtime.instance.stepRuntime.current.status = RuntimeStatus.stopped;
        } else {
            matchedDefinition.addArgsToContext();
        }
    }
}
