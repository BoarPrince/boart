import assert from 'assert';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { ObjectPropertyValidator } from './ObjectPropertyValidator';
import { ObjectValidator } from './ObjectValidator';
import { IBaseValidator } from './IBaseValidator';

/**
 *
 */
export class ObjectArrayPropertyValidator implements IObjectPropertyValidator {
    /**
     *
     */
    readonly type = 'prop';
    private _path: Array<string>;

    /**
     *
     */
    constructor(
        private parentValidator: IBaseValidator,
        private obj: Array<unknown>,
        private readonly propName: string
    ) {
        this._path = [...this.parentValidator.path()];
        assert.ok(Array.isArray(obj), `${this.path().join('.')}\nmust be an array`);
    }

    /**
     *
     */
    private getObjectElements(): Array<unknown> {
        return this.obj
            .flatMap((element: object) => {
                if (typeof element === 'object') {
                    if (!Array.isArray(element)) {
                        return element[this.propName] as unknown;
                    } else {
                        return (element as Array<unknown>).map((propElement) => {
                            return propElement[this.propName] as unknown;
                        });
                    }
                }
                return null;
            })
            .filter((element) => element != null);
    }

    /**
     *
     */
    public parent(): IObjectValidator {
        return ObjectValidator.parent(this.parentValidator);
    }

    /**
     *
     */
    public child(): IObjectValidator {
        const childElements = this.getObjectElements();
        return ObjectValidator.instance(childElements, this);
    }

    /**
     *
     */
    public path(index?: number): Array<string> {
        return index == null ? this._path.concat(this.propName) : this._path.concat(index.toString(), this.propName);
    }

    /**
     *
     */
    public prop(propName: string): IObjectPropertyValidator {
        return this.parentValidator.prop(propName);
    }

    /**
     *
     */
    default(value: string): this {
        if (this.obj[this.propName] == null) {
            this.obj[this.propName] = value;
        }
        return this;
    }

    /**
     *
     */
    public shouldArray(type?: 'string' | 'boolean' | 'unknown'): this {
        const elements = this.getObjectElements();
        ObjectPropertyValidator.shouldArray(elements, this.path(), this.propName, type);
        return this;
    }

    /**
     *
     */
    public shouldString(): this {
        this.getObjectElements().forEach((propElement, index) => {
            if (propElement != null) {
                ObjectPropertyValidator.shouldString(propElement, this.path(index), this.propName);
            }
        });
        return this;
    }

    /**
     *
     */
    public shouldBoolean(): this {
        this.getObjectElements().forEach((propElement, index) => {
            if (propElement != null) {
                ObjectPropertyValidator.shouldBoolean(propElement, this.path(index), this.propName);
            }
        });
        return this;
    }

    /**
     *
     */
    public shouldObject(): this {
        this.getObjectElements().forEach((propElement, index) => {
            if (propElement != null) {
                ObjectPropertyValidator.shouldObject(propElement, this.path(index), this.propName);
            }
        });
        return this;
    }

    /**
     *
     */
    public shouldObjectOrFunction(): this {
        this.getObjectElements().forEach((propElement, index) =>
            ObjectPropertyValidator.shouldObjectOrFunction(propElement, this.path(index), this.propName)
        );
        return this;
    }

    /**
     *
     */
    public shouldHaveValueOf(...values: string[]): this {
        this.getObjectElements().forEach((propElement, index) => {
            if (propElement != null) {
                ObjectPropertyValidator.shouldValueOf(propElement, this.path(index), this.propName, values);
            }
        });
        return this;
    }

    /**
     *
     */
    check(validator: (validator: IObjectPropertyValidator) => IObjectPropertyValidator): IObjectPropertyValidator {
        return validator(this);
    }
}
