import assert from 'assert';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayPropertyValidator } from './ObjectArrayPropertyValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';
import { ObjectValidator } from './ObjectValidator';

/**
 *
 */
export class ObjectArrayValidator implements IObjectValidator {
    private objects: Array<object>;

    /**
     *
     */
    constructor(
        private parentObjectValidator: IObjectValidator,
        objArr: Array<unknown>
    ) {
        this.objects = objArr as Array<object>;
        assert.ok(Array.isArray(this.objects), `must be an array but is => ${JSON.stringify(this.objects, null, '  ')}`);
    }

    /**
     *
     */
    public parent(): IObjectValidator {
        return this.parentObjectValidator ?? this;
    }

    /**
     *
     */
    public shouldArray(): IObjectValidator {
        return this;
    }

    /**
     *
     */
    public notNull(): ObjectArrayValidator {
        this.objects.forEach((obj) => ObjectValidator.notNull(obj));
        return this;
    }

    /**
     *
     */
    public containsProperties(props: Array<string>): ObjectArrayValidator {
        this.objects.forEach((obj) => ObjectValidator.containsOnlyProperties(obj, props));
        return this;
    }

    /**
     *
     */
    public containsPropertiesOnly(props: Array<string>, optionalProps?: Array<string>): ObjectArrayValidator {
        this.objects.forEach((obj) => ObjectValidator.containsOnlyProperties(obj, props, optionalProps));
        return this;
    }

    /**
     *
     */
    public prop(prop: string): IObjectPropertyValidator {
        return new ObjectArrayPropertyValidator(this, this.objects, prop);
    }
}
