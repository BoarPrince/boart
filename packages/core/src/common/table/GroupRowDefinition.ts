import { Observable } from 'rxjs';

import { ArraySubject } from '../ArraySubject';
import { ExecutionContext } from '../execution/ExecutionContext';

import { BaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';
import { TypedGroupValidator } from './Validators/GroupValidator';



/**
 *
 */
export class GroupRowDefinition<
    TExecutionContext extends ExecutionContext<object, object, object>,
    TRowType extends BaseRowType<TExecutionContext>
> {
    private readonly _validations = new ArraySubject<TypedGroupValidator<TExecutionContext, TRowType>>();
    private readonly _definitions = new ArraySubject<RowDefinition<TExecutionContext, TRowType>>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static readonly singleton = new Map<string, GroupRowDefinition<any, any>>();

    /**
     *
     */
    private constructor(private readonly name_: string) {}

    /**
     *
     */
    static getInstance<TExecutionContext extends ExecutionContext<object, object, object>, TRowType extends BaseRowType<TExecutionContext>>(
        name: string
    ): GroupRowDefinition<TExecutionContext, TRowType> {
        if (!GroupRowDefinition.singleton.has(name)) {
            GroupRowDefinition.singleton.set(name, new GroupRowDefinition<TExecutionContext, TRowType>(name));
        }

        return GroupRowDefinition.singleton.get(name);
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
