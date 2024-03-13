import { DefaultContext, DefaultRowType, ExecutionUnit } from '@boart/core';
import { StepReport } from '@boart/core';

/**
 *
 */
export class DataExecutionUnit implements ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
    readonly key = Symbol('data');
    /**
     *
     */
    public description = () => ({
        id: 'data:unit',
        description: '',
        examples: [
            {
                title: 'create objects',
                example: `
                 | action | value |
                 |--------|-------|
                 | in#a   | 1     |
                 | in#b   | 2     |
                 | store  | out   |

                 result is: \${store:out}
                 containing the value:

                 \`\`\`json
                  {
                    a: 1,
                    b: 2
                  }
                  \`\`\``
            },
            {
                title: 'manipulating data',
                example: `
                | action | value     |
                |--------|-----------|
                | in     | i.n.p.u.t |
                | store  | out       |`
            }
        ]
    });

    /**
     *
     */
    execute(context: DefaultContext): void {
        StepReport.instance.type = 'data handling';
        StepReport.instance.addInputItem('Data Handling (input)', 'json', context.preExecution.payload);

        context.execution.data = context.preExecution.payload;
    }
}
