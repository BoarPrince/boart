import { IBaseValidator } from './IBaseValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { NullObjectPropertyValidator } from './NullObjectPropertyValidator';

/**
 *
 */
export class NullObjectValidator implements IObjectValidator {
    type: 'object';

    /**
     *
     */
    constructor(private _parent: IBaseValidator) {}

    /**
     *
     */
    shouldArray(): IObjectValidator {
        return this;
    }

    /**
     *
     */
    shouldObject(): IObjectValidator {
        return this;
    }

    /**
     *
     */
    shouldString(): IObjectValidator {
        return this;
    }

    /**
     *
     */
    notNull(): IObjectValidator {
        return this;
    }

    /**
     *
     */
    containsProperties(): IObjectValidator {
        return this;
    }

    /**
     *
     */
    onlyContainsProperties(): IObjectValidator {
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
        return new NullObjectPropertyValidator(this);
    }

    /**
     *
     */
    parent(): IObjectValidator {
        return this._parent as IObjectValidator;
    }
}
