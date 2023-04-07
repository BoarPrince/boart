import { ExecutionUnit } from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';
import { StepReport } from '@boart/protocol';

/**
 *
 */
export class DataExecutionUnit implements ExecutionUnit<DataContext, RowTypeValue<DataContext>> {
    /**
     *
     */
    public description = {
        id: 'data:unit',
        title: 'data',
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
    };

    /**
     *
     */
    execute(context: DataContext): void {
        StepReport.instance.type = 'data handling';
        StepReport.instance.addInputItem('Data Handling (input)', 'json', context.preExecution.payload);

        context.execution.data = context.preExecution.payload;
    }
}
