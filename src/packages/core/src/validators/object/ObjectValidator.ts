import assert from 'assert';
import { ObjectPropertyValidator } from './ObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayValidator } from './ObjectArrayValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { IBaseValidator } from './IBaseValidator';

/**
 *
 */
export class ObjectValidator implements IObjectValidator {
    /**
     *
     */
    readonly type = 'object';
    private _path: Array<string>;

    /**
     *
     */
    private constructor(
        private parentValidator: IBaseValidator,
        private value: object | string,
        private basePath: string
    ) {
        this._path = [...(parentValidator?.path() || [this.basePath || '$'])];
    }

    /**
     *
     */
    public static instance(obj: object | string, parentValidator?: IBaseValidator, basePath?: string): IObjectValidator {
        return Array.isArray(obj) //
            ? new ObjectArrayValidator(parentValidator, obj, basePath)
            : new ObjectValidator(parentValidator, obj, basePath);
    }

    /**
     *
     */
    public static parent(parentValidator: IBaseValidator): IObjectValidator {
        let parent = parentValidator;
        while (parent && parent.type !== 'object') {
            parent = parent.parent();
            if (parentValidator.type === 'object') {
                return;
            }
        }
        return parent as IObjectValidator;
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
    public path(): Array<string> {
        return this._path;
    }

    /**
     *
     */
    public prop(prop: string): IObjectPropertyValidator {
        return ObjectPropertyValidator.instance(this, this.value, prop);
    }

    /**
     *
     */
    public static shouldArray(obj: object, path: Array<string>, type?: 'string' | 'boolean' | 'unknown') {
        if (!type) {
            return;
        }
        (obj as Array<unknown>).forEach((propElement) => {
            assert.ok(
                typeof propElement === type,
                `path: ${path.join('.')}\narray is not of type ${type} => '${type}: ${JSON.stringify(obj)}'`
            );
        });
    }

    /**
     *
     */
    public shouldArray(type?: 'string' | 'boolean' | 'unknown'): IObjectValidator {
        assert.ok(
            Array.isArray(this.value),
            `path: '${this.path().join('.')}'. Is not of type array<${type || 'any'}>, it's: '${JSON.stringify(this.value, null, '    ')}'`
        );
        ObjectValidator.shouldArray(this.value, this.path(), type);

        return this;
    }

    /**
     *
     */
    public shouldObject(): IObjectValidator {
        assert.ok(
            typeof this.value === 'object' && !Array.isArray(this.value),
            `path: ${this.path().join('.')}\nobject is not of type object => ${JSON.stringify(this.value, null, '    ')}`
        );
        return this;
    }

    /**
     *
     */
    public shouldString(): IObjectValidator {
        assert.ok(
            typeof this.value === 'string',
            `path: ${this.path().join('.')}\nobject is not of type string => ${JSON.stringify(this.value, null, '    ')}`
        );
        return this;
    }

    /**
     *
     */
    public static notNull(obj: object | string, path: Array<string>) {
        assert.ok(obj != null, `path: ${path.join('.')} =>\ncan not be null`);
    }

    /**
     *
     */
    public notNull(): ObjectValidator {
        ObjectValidator.notNull(this.value, this.path());
        return this;
    }

    /**
     *
     */
    public static containsProperties(obj: object, path: Array<string>, props: Array<string>) {
        props.forEach((prop) => {
            assert.ok(
                Object.hasOwn(obj, prop),
                `path: ${path.join('.')}\nmust contain property '${prop}', but only contains '${Object.keys(obj).join(', ')}'`
            );
        });
    }

    /**
     *
     */
    public containsProperties(props: Array<string>): ObjectValidator {
        this.shouldObject();
        ObjectValidator.containsProperties(this.value as object, this.path(), props);
        return this;
    }

    /**
     *
     */
    public static containsOnlyProperties(obj: object, path: Array<string>, props: Array<string>, optionalProps?: Array<string>) {
        ObjectValidator.containsProperties(obj, path, props);
        const allProps = props.concat(optionalProps ?? []);

        Object.keys(obj).forEach((prop) => {
            assert.ok(
                allProps.includes(prop),
                `path: ${path.join('.')}\nproperty '${prop}' not known. Allowed are '${allProps.join(', ')}'`
            );
        });
    }

    /**
     *
     */
    public onlyContainsProperties(props: Array<string>, optionalProps?: Array<string>): ObjectValidator {
        this.shouldObject();
        ObjectValidator.containsOnlyProperties(this.value as object, this.path(), props, optionalProps);
        return this;
    }
}
