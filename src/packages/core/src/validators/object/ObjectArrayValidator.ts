import assert from 'assert';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayPropertyValidator } from './ObjectArrayPropertyValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { ObjectValidator } from './ObjectValidator';
import { IBaseValidator } from './IBaseValidator';

/**
 *
 */
export class ObjectArrayValidator implements IObjectValidator {
    private objects: Array<object>;

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
        objArr: Array<unknown>,
        private basePath: string
    ) {
        this.objects = objArr as Array<object>;
        this._path = this.parentValidator?.path() || [this.basePath || '$'];
        assert.ok(
            Array.isArray(this.objects),
            `path: ${this.path().join('.')}\nmust be an array but is => ${JSON.stringify(this.objects, null, '  ')}`
        );
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
    public path(index?: number): Array<string> {
        return index == null ? this._path : this._path.concat(`[${index}]`);
    }

    /**
     *
     */
    public prop(prop: string): IObjectPropertyValidator {
        return new ObjectArrayPropertyValidator(this, this.objects, prop);
    }

    /**
     *
     */
    public shouldArray(type?: 'string' | 'boolean' | 'unknown'): IObjectValidator {
        ObjectValidator.shouldArray(this.objects, this.path(), type);
        return this;
    }

    /**
     *
     */
    public shouldObject(): IObjectValidator {
        assert.fail(`path: ${this.path().join('.')}\nobject is not of type object => ${JSON.stringify(this.objects, null, '    ')}`);
    }

    /**
     *
     */
    public shouldString(): IObjectValidator {
        assert.fail(`path: ${this.path().join('.')}\nobject is not of type string => ${JSON.stringify(this.objects, null, '    ')}`);
    }

    /**
     *
     */
    public notNull(): ObjectArrayValidator {
        this.objects.forEach((obj, index) => ObjectValidator.notNull(obj, this.path(index)));
        return this;
    }

    /**
     *
     */
    public containsProperties(props: Array<string>): ObjectArrayValidator {
        this.objects.forEach((obj, index) => ObjectValidator.containsOnlyProperties(obj, this.path(index), props));
        return this;
    }

    /**
     *
     */
    public onlyContainsProperties(props: Array<string>, optionalProps?: Array<string>): ObjectArrayValidator {
        this.objects.forEach((obj, index) => ObjectValidator.containsOnlyProperties(obj, this.path(index), props, optionalProps));
        return this;
    }
}
