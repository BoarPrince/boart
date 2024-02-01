import assert from 'assert';
import { ObjectPropertyValidator } from './ObjectPropertyValidator';
import { IObjectValidator } from './IObjectValidator';
import { ObjectArrayValidator } from './ObjectArrayValidator';
import { IObjectPropertyValidator } from './IObjectPropertyValidator';

/**
 *
 */
export class ObjectValidator implements IObjectValidator {
    /**
     *
     */
    private constructor(private obj: object) {}

    /**
     *
     */
    public static instance(obj: object, parentObjectValidator?: IObjectValidator): IObjectValidator {
        return Array.isArray(obj) //
            ? new ObjectArrayValidator(parentObjectValidator, obj)
            : new ObjectValidator(obj);
    }

    /**
     *
     */
    public shouldArray(): IObjectValidator {
        assert.fail(`object is not of type array => ${JSON.stringify(this.obj, null, '    ')}`);
    }

    /**
     *
     */
    public static notNull(obj: object) {
        assert.ok(obj, 'can not be null');
    }

    /**
     *
     */
    public notNull(): ObjectValidator {
        ObjectValidator.notNull(this.obj);
        return this;
    }

    /**
     *
     */
    public static containsProperties(obj: object, props: Array<string>) {
        props.forEach((prop) => {
            assert.ok(Object.hasOwn(obj, prop), `must contain property '${prop}', but only contains '${Object.keys(obj).join(', ')}'`);
        });
    }

    /**
     *
     */
    public containsProperties(props: Array<string>): ObjectValidator {
        ObjectValidator.containsProperties(this.obj, props);
        return this;
    }

    /**
     *
     */
    public static containsOnlyProperties(obj: object, props: Array<string>, optionalProps?: Array<string>) {
        ObjectValidator.containsProperties(obj, props);
        const allProps = props.concat(optionalProps ?? []);

        Object.keys(obj).forEach((prop) => {
            assert.ok(allProps.includes(prop), `property '${prop}' not known. Allowed are '${allProps.join(', ')}'`);
        });
    }

    /**
     *
     */
    public containsPropertiesOnly(props: Array<string>, optionalProps?: Array<string>): ObjectValidator {
        ObjectValidator.containsOnlyProperties(this.obj, props, optionalProps);
        return this;
    }

    /**
     *
     */
    public prop(prop: string): IObjectPropertyValidator {
        return ObjectPropertyValidator.instance(this, this.obj, prop);
    }
}
