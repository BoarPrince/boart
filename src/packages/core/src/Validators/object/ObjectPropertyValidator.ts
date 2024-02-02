import assert from 'assert';
import { ObjectValidator } from './ObjectValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayPropertyValidator } from './ObjectArrayPropertyValidator';

/**
 *
 */
export class ObjectPropertyValidator implements IObjectPropertyValidator {
    private property: unknown;

    /**
     *
     */
    private constructor(
        private parentObjectValidator: IObjectValidator,
        obj: object | string,
        private propName: string
    ) {
        this.property = obj[propName];
    }

    /**
     *
     */
    public static instance(parentObjectValidator: ObjectValidator, obj: object | string, prop: string): IObjectPropertyValidator {
        return Array.isArray(obj) //
            ? new ObjectArrayPropertyValidator(parentObjectValidator, obj, prop)
            : new ObjectPropertyValidator(parentObjectValidator, obj, prop);
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
    public static shouldArray(property: unknown, prop: string, type?: 'string' | 'boolean' | 'unknown') {
        assert.ok(Array.isArray(property), `property '${prop}' is not an array => '${prop}: ${JSON.stringify(property)}'`);

        if (!type) {
            return;
        }

        (property as Array<unknown>).forEach((propElement) => {
            assert.ok(
                typeof propElement === type,
                `property '${prop}' is not of array type ${type} => '${prop}: ${JSON.stringify(property)}'`
            );
        });
        return this;
    }

    /**
     *
     */
    public shouldArray(type?: 'string' | 'boolean' | 'unknown'): this {
        ObjectPropertyValidator.shouldArray(this.property, this.propName, type);
        return this;
    }

    /**
     *
     */
    public static shouldString(property: unknown, prop: string) {
        assert.ok(typeof property === 'string', `property '${prop}' is not of type string => '${prop}: ${JSON.stringify(property)}'`);
    }

    /**
     *
     */
    public shouldString(): this {
        ObjectPropertyValidator.shouldString(this.property, this.propName);
        return this;
    }

    /**
     *
     */
    public static shouldBoolean(property: unknown, prop: string) {
        assert.ok(typeof property === 'boolean', `property '${prop}' is not of type boolean => '${prop}: ${JSON.stringify(property)}'`);
    }
    /**
     *
     */
    public shouldBoolean(): this {
        ObjectPropertyValidator.shouldBoolean(this.property, this.propName);
        return this;
    }

    /**
     *
     */
    public static shouldValueOf(property: unknown, prop: string, values: string[]) {
        ObjectPropertyValidator.shouldString(property, prop);
        assert.ok(
            values.includes(property as string),
            `value '${property as string}' is not allowd for property '${prop}'. Allowed values are => '${values.join(', ')}'`
        );
    }

    /**
     *
     */
    public shouldHaveValueOf(...values: string[]): this {
        ObjectPropertyValidator.shouldValueOf(this.property, this.propName, values);
        return this;
    }

    /**
     *
     */
    public static shouldObject(property: unknown, prop: string) {
        assert.ok(
            typeof property === 'object' && !Array.isArray(property),
            `property '${prop}' is not an object => '${prop}: ${JSON.stringify(property)}'`
        );
        return this;
    }

    /**
     *
     */
    public shouldObject(): ObjectPropertyValidator {
        ObjectPropertyValidator.shouldObject(this.property, this.propName);

        return this;
    }

    /**
     *
     */
    public object(): IObjectValidator {
        assert.ok(
            typeof this.property === 'object' || Array.isArray(this.property),
            `property '${this.propName}' must be an object or an array`
        );
        return ObjectValidator.instance(this.property as object);
    }
}
