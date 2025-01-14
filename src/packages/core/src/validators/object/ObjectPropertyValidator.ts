import assert from 'assert';
import { ObjectValidator } from './ObjectValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayPropertyValidator } from './ObjectArrayPropertyValidator';
import { IBaseValidator } from './IBaseValidator';
import { NullObjectValidator } from './NullIObjectValidator';
import { NullObjectPropertyValidator } from './NullObjectPropertyValidator';

/**
 *
 */
export class ObjectPropertyValidator implements IObjectPropertyValidator {
    /**
     *
     */
    readonly type = 'prop';
    private _path: Array<string>;

    /**
     *
     */
    private get property(): unknown {
        return this.obj[this.propName] as unknown;
    }

    /**
     *
     */
    private constructor(
        private parentValidator: IBaseValidator,
        private obj: object | string,
        private readonly propName: string
    ) {
        this._path = parentValidator.path().concat(propName);
    }

    /**
     *
     */
    public static instance(parentValidator: IBaseValidator, obj: object | string, prop: string): IObjectPropertyValidator {
        return Array.isArray(obj) //
            ? new ObjectArrayPropertyValidator(parentValidator, obj, prop)
            : new ObjectPropertyValidator(parentValidator, obj, prop);
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
    public parent(): IObjectValidator {
        return ObjectValidator.parent(this.parentValidator);
    }

    /**
     *
     */
    public child(): IObjectValidator {
        if (this.property == null) {
            return new NullObjectValidator(this.parentValidator);
        }

        assert.ok(
            typeof this.property === 'object' || Array.isArray(this.property),
            `path: ${this.path().join('.')}\nproperty '${this.propName}' must be an object or an array, but is ${JSON.stringify(
                this.property
            )}`
        );
        return ObjectValidator.instance(this.property as object, this);
    }

    /**
     *
     */
    public path(): Array<string> {
        return this._path;
    }

    /**
     *
     */
    public static path(path: Array<string>, index: number): Array<string> {
        const pathWithIndex = [...path];
        const lastElement = pathWithIndex.pop();
        pathWithIndex.push(index.toString());
        pathWithIndex.push(lastElement);
        return pathWithIndex;
    }

    /**
     *
     */
    public prop(propName: string): IObjectPropertyValidator {
        if (this.property == null) {
            return new NullObjectPropertyValidator(this);
        }
        return this.parentValidator.prop(propName);
    }

    /**
     *
     */
    public static shouldArray(property: unknown, path: Array<string>, prop: string, type?: 'string' | 'boolean' | 'unknown') {
        assert.ok(
            Array.isArray(property),
            `path: ${path.join('.')}\nproperty '${prop}' is not an array => '${prop}: ${JSON.stringify(property)}'`
        );

        if (!type) {
            return;
        }

        (property as Array<unknown>).forEach((propElement, index) => {
            const pathWithIndex = ObjectPropertyValidator.path(path, index).join('.');
            assert.ok(
                typeof propElement === type,
                `path: ${pathWithIndex}\nproperty '${prop}' is not of array type ${type} => '${prop}: ${JSON.stringify(property)}'`
            );
        });

        return this;
    }

    /**
     *
     */
    public shouldArray(type?: 'string' | 'boolean' | 'unknown'): this {
        ObjectPropertyValidator.shouldArray(this.property, this.path(), this.propName, type);
        return this;
    }

    /**
     *
     */
    public static shouldString(property: unknown, path: Array<string>, prop: string) {
        assert.ok(
            typeof property === 'string',
            `path: ${path.join('.')}\nproperty '${prop}' is not of type string => '${prop}: ${JSON.stringify(property)}'`
        );
    }

    /**
     *
     */
    public shouldString(): this {
        ObjectPropertyValidator.shouldString(this.property, this.path(), this.propName);
        return this;
    }

    /**
     *
     */
    public static shouldBoolean(property: unknown, path: Array<string>, prop: string) {
        assert.ok(
            typeof property === 'boolean',
            `path: ${path.join('.')}\nproperty '${prop}' is not of type boolean => '${prop}: ${JSON.stringify(property)}'`
        );
    }
    /**
     *
     */
    public shouldBoolean(): this {
        ObjectPropertyValidator.shouldBoolean(this.property, this.path(), this.propName);
        return this;
    }

    /**
     *
     */
    public static shouldValueOf(property: unknown, path: Array<string>, prop: string, values: string[]) {
        ObjectPropertyValidator.shouldString(property, path, prop);
        assert.ok(
            values.includes(property as string),
            `path: ${path.join('.')}\nvalue '${property as string}' is not allowd for property '${prop}'. Available:${values
                .map((v) => `\n - '${v}'`)
                .join(',')}`
        );
    }

    /**
     *
     */
    public shouldHaveValueOf(...values: string[]): this {
        if (Array.isArray(this.property)) {
            this.property.forEach((property, index) =>
                ObjectPropertyValidator.shouldValueOf(property, this.path().concat(index.toString()), this.propName, values)
            );
        } else {
            ObjectPropertyValidator.shouldValueOf(this.property, this.path(), this.propName, values);
        }
        return this;
    }

    /**
     *
     */
    public static shouldObject(property: unknown, path: Array<string>, prop: string) {
        assert.ok(
            typeof property === 'object' && !Array.isArray(property),
            `path: ${path.join('.')}\nproperty '${prop}' is not an object => '${prop}: ${JSON.stringify(property)}'`
        );
        return this;
    }

    /**
     *
     */
    public shouldObject(): ObjectPropertyValidator {
        ObjectPropertyValidator.shouldObject(this.property, this.path(), this.propName);

        return this;
    }

    /**
     *
     */
    public static shouldObjectOrFunction(property: unknown, path: Array<string>, prop: string) {
        assert.ok(
            (typeof property === 'object' && !Array.isArray(property)) || typeof property === 'function',
            `path: ${path.join('.')}\nproperty '${prop}' is not an object or a function => '${prop}: ${JSON.stringify(property)}'`
        );
        return this;
    }

    /**
     *
     */
    public shouldObjectOrFunction(): ObjectPropertyValidator {
        ObjectPropertyValidator.shouldObjectOrFunction(this.property, this.path(), this.propName);

        return this;
    }

    /**
     *
     */
    check(validator: (validator: IObjectPropertyValidator) => IObjectPropertyValidator): IObjectPropertyValidator {
        return validator(this);
    }
}
