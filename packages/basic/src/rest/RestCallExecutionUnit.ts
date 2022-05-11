import { AsyncExecutionUnit } from '@boart/core';
import { DataContext, RowTypeValue } from '@boart/core-impl';

import { RestCallContext } from './RestCallContext';

/**
 *
 */
export class RestCallExecutionUnit implements AsyncExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>> {
    description = 'rest call - main';

    /**
     *
     */
    execute(context: DataContext, row: RowTypeValue<DataContext>): Promise<void> {
        console.log(context, row);
        return null;
        // context.execution.data =
    }
}
