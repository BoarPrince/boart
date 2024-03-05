import { IBaseValidator } from './IBaseValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { NullObjectValidator } from './NullIObjectValidator';

/**
 *
 */

export class NullObjectPropertyValidator implements IObjectPropertyValidator {
    readonly type: 'prop';

    /**
     *
     */
    constructor(private _parent: IBaseValidator) {}

    /**
     *
     */
    shouldArray(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    shouldString(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    shouldBoolean(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    shouldObject(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    shouldObjectOrFunction(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    shouldHaveValueOf(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    default(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    child(): IObjectValidator {
        return new NullObjectValidator(this._parent);
    }

    /**
     *
     */
    check(): IObjectPropertyValidator {
        return this;
    }

    /**
     *
     */
    path(): string[] {
        return [];
    }

    /**
     *
     */
    prop(): IObjectPropertyValidator {
        return new NullObjectPropertyValidator(this._parent);
    }

    /**
     *
     */
    parent(): IObjectValidator {
        return this._parent as IObjectValidator;
    }
}
