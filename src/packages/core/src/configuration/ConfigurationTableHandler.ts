import { DefaultContext } from '../default/DefaultExecutionContext';
import { DefaultRowType } from '../default/DefaultRowType';
import { ExecutionUnit } from '../execution/ExecutionUnit';
import { RemoteFactory } from '../remote/RemoteFactory';
import { GroupRowDefinition } from '../table/GroupRowDefinition';
import { RowDefinition } from '../table/RowDefinition';
import { TableHandler } from '../table/TableHandler';
import { TableHandlerBaseImpl } from '../table/TableHandlerBaseImpl';
import { GroupValidator } from '../validators/GroupValidator';

/**
 *
 */
export class ConfigurationTableHandler extends TableHandlerBaseImpl<DefaultContext, DefaultRowType<DefaultContext>> {
    private callCount = 0;

    /**
     *
     */
    constructor(
        public readonly name: string,
        private context: DefaultContext,
        private factory: RemoteFactory,
        private rowDefinitions: Array<RowDefinition<DefaultContext, DefaultRowType<DefaultContext>>>,
        private groupRowDef: Array<string>,
        private groupValidations: Array<GroupValidator>
    ) {
        super();
    }

    /**
     *
     */
    protected rowType = () => DefaultRowType;

    /**
     *
     */
    protected mainExecutionUnit(): ExecutionUnit<DefaultContext, DefaultRowType<DefaultContext>> {
        if (this.callCount++ === 0) {
            this.factory.start();
        }

        return this.factory.executionUnit;
    }

    /**
     *
     */
    protected newContext(): DefaultContext {
        // each time the context must be new
        return JSON.parse(JSON.stringify(this.context)) as DefaultContext;
    }

    /**
     *
     */
    protected addGroupRowDefinition(tableHandler: TableHandler<DefaultContext, DefaultRowType<DefaultContext>>): void {
        for (const groupRowDef of this.groupRowDef) {
            tableHandler.addGroupRowDefinition(GroupRowDefinition.getInstance(groupRowDef));
        }
    }

    /**
     *
     */
    protected addRowDefinition(tableHandler: TableHandler<DefaultContext, DefaultRowType<DefaultContext>>): void {
        for (const rowDefinition of this.rowDefinitions) {
            tableHandler.addRowDefinition(rowDefinition);
        }
    }

    /**
     *
     */
    protected addGroupValidation(tableHandler: TableHandler<DefaultContext, DefaultRowType<DefaultContext>>): void {
        for (const groupValidation of this.groupValidations) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            tableHandler.addGroupValidator(groupValidation);
        }
    }
}
