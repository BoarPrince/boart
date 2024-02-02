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
    private constructor(private value: object | string) {}

    /**
     *
     */
    public static instance(obj: object | string, parentObjectValidator?: IObjectValidator): IObjectValidator {
        return Array.isArray(obj) //
            ? new ObjectArrayValidator(parentObjectValidator, obj)
            : new ObjectValidator(obj);
    }

    /**
     *
     */
    public static shouldArray(obj: object, type?: 'string' | 'boolean' | 'unknown') {
        if (!type) {
            return;
        }
        (obj as Array<unknown>).forEach((propElement) => {
            assert.ok(typeof propElement === type, `array is not of type ${type} => '${type}: ${JSON.stringify(obj)}'`);
        });
    }

    /**
     *
     */
    public shouldArray(type?: 'string' | 'boolean' | 'unknown'): IObjectValidator {
        assert.ok(Array.isArray(this.value), `object is not of type array => ${JSON.stringify(this.value, null, '    ')}`);
        ObjectValidator.shouldArray(this.value, type);

        return this;
    }

    /**
     *
     */
    public shouldObject(): IObjectValidator {
        assert.ok(
            typeof this.value === 'object' && !Array.isArray(this.value),
            `object is not of type object => ${JSON.stringify(this.value, null, '    ')}`
        );
        return this;
    }

    /**
     *
     */
    public shouldString(): IObjectValidator {
        assert.ok(typeof this.value === 'string', `object is not of type string => ${JSON.stringify(this.value, null, '    ')}`);
        return this;
    }

    /**
     *
     */
    public static notNull(obj: object | string) {
        assert.ok(obj != null, 'can not be null');
    }

    /**
     *
     */
    public notNull(): ObjectValidator {
        ObjectValidator.notNull(this.value);
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
        this.shouldObject();
        ObjectValidator.containsProperties(this.value as object, props);
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
        this.shouldObject();
        ObjectValidator.containsOnlyProperties(this.value as object, props, optionalProps);
        return this;
    }

    /**
     *
     */
    public prop(prop: string): IObjectPropertyValidator {
        return ObjectPropertyValidator.instance(this, this.value, prop);
    }
}
