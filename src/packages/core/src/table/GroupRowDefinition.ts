import { Observable } from 'rxjs';

import { TypedGroupValidator } from '../validators/GroupValidator';
import { ArraySubject } from '../common/ArraySubject';
import { ExecutionContext } from '../execution/ExecutionContext';

import { BaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';

/**
 *
 */
export class GroupRowDefinition<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    private readonly _validations = new ArraySubject<TypedGroupValidator<TExecutionContext, TRowType>>();
    private readonly _definitions = new ArraySubject<RowDefinition<TExecutionContext, TRowType>>();

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static get instance(): Map<string, GroupRowDefinition<any, any>> {
        if (!globalThis._groupDefinitionInstance) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            globalThis._groupDefinitionInstance = new Map<string, GroupRowDefinition<any, any>>();
        }
        return globalThis._groupDefinitionInstance;
    }

    /**
     *
     */
    private constructor(private readonly name_: string) {}

    /**
     *
     */
    static contains(name: string): boolean {
        return GroupRowDefinition.instance.has(name);
    }

    /**
     *
     */
    static keys(): Array<string> {
        return Array.from(GroupRowDefinition.instance.keys());
    }

    /**
     *
     */
    static getInstance<TExecutionContext extends ExecutionContext<object, object, object>, TRowType extends BaseRowType<TExecutionContext>>(
        name: string
    ): GroupRowDefinition<TExecutionContext, TRowType> {
        if (!GroupRowDefinition.instance.has(name)) {
            GroupRowDefinition.instance.set(name, new GroupRowDefinition<TExecutionContext, TRowType>(name));
        }

        return GroupRowDefinition.instance.get(name);
    }

    /**
     *
     */
    get name(): string {
        return this.name_;
    }

    /**
     *
     */
    addRowDefinition(definition: RowDefinition<TExecutionContext, TRowType>): void {
        this._definitions.next(definition);
    }

    /**
     *
     */
    addGroupValidation(validation: TypedGroupValidator<TExecutionContext, TRowType>): void {
        this._validations.next(validation);
    }

    /**
     *
     */
    get definitions(): Observable<RowDefinition<TExecutionContext, TRowType>> {
        return this._definitions;
    }

    /**
     *
     */
    get validations(): Observable<TypedGroupValidator<TExecutionContext, TRowType>> {
        return this._validations;
    }
}
