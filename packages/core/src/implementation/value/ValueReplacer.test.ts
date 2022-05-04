import { EnvironmentReplacer } from './EnvironmentReplacer';
import { ScopedType } from '../../types/ScopedType';
import { EnvLoader } from '../../common/EnvLoader';
import { ValueReplacer } from '../../value/ValueReplacer';
import { GenerateReplacer } from './GenerateReplacer';
import { TextLanguageHandler } from '../../common/TextLanguageHandler';
import { GeneratorHandler } from '../../generator/GeneratorHandler';
import { ReferenceHandler } from '../../common/ReferenceHandler';
import { ReferenceReplacer } from './ReferenceReplacer';
import { StoreReplacer } from './StoreReplace';
import { TextReplacer } from './TextReplacer';

/**
 *
 */
jest.mock('../../common/EnvLoader', () => {
    return {
        EnvLoader: {
            instance: {
                get: jest.fn()
            }
        }
    };
});

/**
 *
 */
jest.mock('../../generator/GeneratorHandler', () => {
    return {
        GeneratorHandler: {
            instance: {
                generate: jest.fn()
            }
        }
    };
});

/**
 *
 */
jest.mock('../../common/TextLanguageHandler', () => {
    return {
        TextLanguageHandler: {
            instance: {
                get: jest.fn()
            }
        }
    };
});

/**
 *
 */
jest.mock('../../common/ReferenceHandler', () => {
    return {
        ReferenceHandler: {
            getProperty: jest.fn()
        }
    };
});

/**
 *
 */
describe('check replacers', () => {
    /**
     *
     */
    it('check environment replacement', () => {
        const sut: ValueReplacer = new EnvironmentReplacer();

        expect(sut.name).toBe('EnvironmentReplacer');
        expect(sut.getProperty).toBeUndefined();
        expect(sut.priority).toBe(1000);
        expect(sut.scoped).toBe(ScopedType.false);

        sut.replace('yyyy');

        expect(EnvLoader.instance.get).toBeCalled();
        expect(EnvLoader.instance.get).toBeCalledWith('yyyy', null, true);
    });

    /**
     *
     */
    it('check generate replacer', () => {
        const sut: ValueReplacer = new GenerateReplacer();

        expect(sut.name).toBe('GenerateReplacer');
        expect(sut.getProperty).toBeUndefined();
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        sut.replace('xxxx');

        expect(GeneratorHandler.instance.generate).toBeCalled();
        expect(GeneratorHandler.instance.generate).toBeCalledWith('xxxx');
    });

    /**
     *
     */
    it('check reference replacer (valid property)', () => {
        const sut: ValueReplacer = new ReferenceReplacer();

        expect(sut.name).toBe('ReferenceReplacer');
        expect(sut.getProperty).toBeUndefined();
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        sut.replace('\\x/x-x/-x-x#_y-yyy2');

        expect(ReferenceHandler.getProperty).toBeCalled();
        expect(ReferenceHandler.getProperty).toBeCalledWith('\\x/x-x/-x-x', '_y-yyy2');
    });

    /**
     *
     */
    it('check reference replacer (not valid property)', () => {
        const sut: ValueReplacer = new ReferenceReplacer();

        expect(sut.name).toBe('ReferenceReplacer');
        expect(sut.getProperty).toBeUndefined();
        expect(sut.priority).toBe(900);
        expect(sut.scoped).toBe(ScopedType.true);

        const value = sut.replace('\\xxxxx##yyyy');

        expect(ReferenceHandler.getProperty).not.toBeCalled();
        expect(value).toBeNull();
    });

    /**
     *
     */
    it('check store replacer (no default)', () => {
        const sut: ValueReplacer = new StoreReplacer();

        expect(sut.name).toBe('StoreReplacer');
        expect(sut.getProperty).toBeDefined();
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.multiple);

        const property = 'xxxxx##yyyy';

        const replacedValue = sut.replace(property);
        expect(replacedValue).toBeUndefined();

        const propValue = sut.getProperty(property);
        expect(propValue).toBe('xxxxx##yyyy');
    });

    /**
     *
     */
    it('check store replacer (with default)', () => {
        const sut: ValueReplacer = new StoreReplacer();

        expect(sut.name).toBe('StoreReplacer');
        expect(sut.getProperty).toBeDefined();
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.multiple);

        const property = 'xxxxx##yyyy:-default';

        const replacedValue = sut.replace(property);
        expect(replacedValue).toBe('default');

        const propValue = sut.getProperty(property);
        expect(propValue).toBe('xxxxx##yyyy');
    });

    /**
     *
     */
    it('check text replacer', () => {
        const sut: ValueReplacer = new TextReplacer();

        expect(sut.name).toBe('TextReplacer');
        expect(sut.getProperty).toBeUndefined();
        expect(sut.priority).toBe(950);
        expect(sut.scoped).toBe(ScopedType.false);

        sut.replace('xxxx');

        expect(TextLanguageHandler.instance.get).toBeCalled();
        expect(TextLanguageHandler.instance.get).toBeCalledWith('xxxx');
    });
});
