import { ExpectedOperatorInitializer } from '../expected/ExpectedOperatorInitializer';
import { TableHandler } from '../table/TableHandler';

import { Description } from './Description';

/**
 *
 */
interface TableHandlerDescription {
    desc: Description;
    dataTables: ReadonlyArray<Description>;
}

/**
 *
 */
interface ExpectedDescription {
    desc: Description;
    operators: ReadonlyArray<Description>;
}

/**
 *
 */
interface Descriptions {
    tableHandlers: ReadonlyArray<TableHandlerDescription>;
    expected: ExpectedDescription;
}

/**
 *
 */
export class DescriptionHandler {
    /**
     *
     */
    public describe(): void {
        const descriptions: Descriptions = {
            tableHandlers: TableHandler.tableHandlers.map((handler) => this.describeTableHandler(handler)),
            expected: this.describeExpectedOperation()
        };

        JSON.stringify(descriptions);
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private describeTableHandler(tableHandler: TableHandler<any, any>): TableHandlerDescription {
        const desc: TableHandlerDescription = {
            desc: DescriptionHandler.solve(tableHandler.executionEngine.mainExecutionUnit().description),
            dataTables: tableHandler
                .getRowDefinitions()
                .filter((def) => !!def.description)
                .map((def) => DescriptionHandler.solve(def.description))
        };

        return desc;
    }

    /**
     *
     */
    private describeExpectedOperation(): ExpectedDescription {
        return {
            desc: DescriptionHandler.solve(ExpectedOperatorInitializer.instance.description),
            operators: ExpectedOperatorInitializer.instance.operators
                .filter((op) => !!op.description)
                .map((op) => DescriptionHandler.solve(op.description))
        };
    }

    /**
     *
     * */
    public static solve(description: Description | (() => Description)): Description {
        return (
            (typeof description === 'function' ? description() : description) || {
                id: '',
                title: '',
                description: '',
                examples: null
            }
        );
    }
}
