import assert from 'assert';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayValidator } from './ObjectArrayValidator';
import { ObjectPropertyValidator } from './ObjectPropertyValidator';
import { ObjectValidator } from './ObjectValidator';

/**
 *
 */
export class ObjectArrayPropertyValidator implements IObjectPropertyValidator {
    // private property: Array<unknown>;

    /**
     *
     */
    constructor(
        private parentObjectValidator: IObjectValidator,
        private obj: Array<unknown>,
        private propName: string
    ) {
        assert.ok(Array.isArray(obj), `must be an array`);
    }

    /**
     *
     */
    private getObjectElements(): Array<unknown> {
        return this.obj.flatMap((element: object) => {
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
        });
    }

    /**
     *
     */
    public parent(): IObjectValidator {
        return this.parentObjectValidator;
    }

    /**
     *
     */
    public prop(propName: string): IObjectPropertyValidator {
        return this.parentObjectValidator.prop(propName);
    }

    /**
     *
     */
    public shouldArray(): this {
        this.getObjectElements().forEach((propElement) => ObjectPropertyValidator.shouldArray(propElement, this.propName));
        return this;
    }

    /**
     *
     */
    public shouldString(): this {
        this.getObjectElements().forEach((propElement) => ObjectPropertyValidator.shouldString(propElement, this.propName));
        return this;
    }

    /**
     *
     */
    public shouldObject(): this {
        this.getObjectElements().forEach((propElement) => ObjectPropertyValidator.shouldObject(propElement, this.propName));
        return this;
    }

    /**
     *
     */
    public shouldHaveValueOf(...values: string[]): this {
        this.getObjectElements().forEach((propElement) => ObjectPropertyValidator.shouldValueOf(propElement, this.propName, values));
        return this;
    }

    /**
     *
     */
    public object(): IObjectValidator {
        const childElements = this.getObjectElements();
        return ObjectValidator.instance(childElements, this.parentObjectValidator);
    }
}
