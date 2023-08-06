import { ParaDescription } from '../pipe/ParaDescription';
import { Pipe } from '../pipe/Pipe';
import { PipeHandler } from '../pipe/PipeHandler';
import { PipeResolver } from '../pipe/PipeResolver';
import { Store } from '../store/Store';
import { StoreWrapper } from '../store/StoreWrapper';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

import { ReplaceArg, ValueReplacer } from './ValueReplacer';
import { ValueReplacerHandler } from './ValueReplacerHandler';
import { ValueResolver } from './ValueResolver';

/**
 *
 */
type ReplaceResult = string | null | undefined;

/**
 *
 */
const valueReplacerHandlerMock = (
    returnValue: string = '#',
    store = null,
    scoped = ScopedType.true,
    priority = 100,
    name = 'ValueReplacerMock'
) => {
    const replacer: {
        handler: ValueReplacerHandler;
        replacer: ValueReplacer;
    } = {} as any;

    replacer.handler = {
        get: (name: string): ValueReplacer => {
            if (returnValue === '#') {
                replacer.replacer = new ValueReplacerMock();
            } else {
                replacer.replacer = new ValueReplacerCustimizeMock(returnValue, store, scoped, priority, name);
            }
            return replacer.replacer;
        }
    } as any;
    return replacer;
};

/**
 *
 */
class ValueReplacerMock implements ValueReplacer {
    get name() {
        return 'ValueReplacerMock';
    }
    priority = 100;
    scoped = ScopedType.true;
    replace = jest.fn((property: string): ReplaceResult => null);
    replace2 = jest.fn((arg: ReplaceArg): ReplaceResult => {
        let value = `${arg.qualifier.value}`;

        if (arg.qualifier.paras?.length) {
            value += `:${arg.qualifier.paras?.join(':')}:`;
        }

        if (arg.default) {
            value += `${arg.default.operator}${arg.default.value}`;
        }

        return value;
    });
}

/**
 *
 */
class ValueReplacerCustimizeMock implements ValueReplacer {
    constructor(
        public returnValue: string,
        public defaultScopeType2: ScopeType,
        public scoped,
        public priority,
        public name
    ) {}
    replace = jest.fn((property: string): ReplaceResult => this.returnValue);
    replace2 = jest.fn((arg: ReplaceArg, store: StoreWrapper): ReplaceResult => this.returnValue);
}

/**
 *
 */
let sut: ValueResolver;

/**
 *
 */
beforeEach(() => {
    sut = new ValueResolver(valueReplacerHandlerMock().handler);
    Store.instance.globalStore.clear();
    Store.instance.localStore.clear();
    Store.instance.testStore.clear();
    Store.instance.stepStore.clear();
});

/**
 *
 */
it('default', () => {
    const replacedValue = sut.replace('--${replacer:a}--');
    expect(replacedValue).toBe('--a--');
});
/**
 *
 */
it('default', () => {
    const replacedValue = sut.replace('--${replacer:a}--');
    expect(replacedValue).toBe('--a--');
});

/**
 *
 */
it('deep 1', () => {
    const replacedValue = sut.replace('--${replacer:a:"${replacer:b}"}--');
    expect(replacedValue).toBe('--a:b:--');
});

/**
 *
 */
it('deep 2', () => {
    const replacedValue = sut.replace('--${replacer:a:"${replacer:${replacer:c}}"}--');
    expect(replacedValue).toBe('--a:c:--');
});

/**
 *
 */
it('deep 2', () => {
    const replacedValue = sut.replace('--${replacer:${replacer:d}}--');
    expect(replacedValue).toBe('--d--');
});

/**
 *
 */
it('replace null', () => {
    sut = new ValueResolver(valueReplacerHandlerMock(null).handler);

    const replacedValue = sut.replace('${replacer:null}');
    expect(replacedValue).toBeNull();
});

/**
 *
 */
it('replace undefined', () => {
    sut = new ValueResolver(valueReplacerHandlerMock().handler);

    const replacedValue = sut.replace('${replacer:undefined}');
    expect(replacedValue).toBeUndefined();
});

/**
 *
 */
it('replace empty string', () => {
    sut = new ValueResolver(valueReplacerHandlerMock('').handler);

    const replacedValue = sut.replace('${replacer:empty}');
    expect(replacedValue).toBe('');
});

/**
 *
 */
it('step store is not defined', () => {
    const mock = valueReplacerHandlerMock('');
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toBeCalledWith(expect.anything(), null);
});

/**
 *
 */
it('step store is default scope', () => {
    const mock = valueReplacerHandlerMock('', ScopeType.Step);
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toBeCalledWith(expect.anything(), Store.instance.stepStore);
});

/**
 *
 */
it('when no scope is defined, take default scope - local', () => {
    const mock = valueReplacerHandlerMock('', ScopeType.Test);
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toBeCalledWith(expect.anything(), Store.instance.testStore);
});

/**
 *
 */
it('when no scope is defined, take default scope - global', () => {
    const mock = valueReplacerHandlerMock('', ScopeType.Global);
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toBeCalledWith(expect.anything(), Store.instance.globalStore);
});

/**
 *
 */
it('defined scope must be used', () => {
    const mock = valueReplacerHandlerMock('', ScopeType.Test);
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer@g:a}');
    expect(mock.replacer.replace2).toBeCalledWith(expect.anything(), Store.instance.globalStore);
});

/**
 *
 */
it('wrong scope is used', () => {
    const mock = valueReplacerHandlerMock('', ScopeType.Test);
    sut = new ValueResolver(mock.handler);

    expect(() => sut.replace('${replacer@z:a}')).toThrowError('Expected [ \\t] or [glts] but "z" found.\n${replacer@ -> z <- :a}');
});

/**
 *
 */
it('replacer does not expect a scope', () => {
    const mock = valueReplacerHandlerMock('', ScopeType.Test, ScopedType.false);
    sut = new ValueResolver(mock.handler);

    expect(() => sut.replace('${replacer@t:a}')).toThrowError('value replacer "replacer" can\'t have a scope!\n${replacer -> @t <- :a}');
});

/**
 *
 */
describe('using pipe', () => {
    /**
     *
     */
    class PipeMock implements Pipe {
        name = 'pippe';
        constructor(public paraDesc?: ParaDescription[]) {}
        run = jest.fn((value: string): string => `${value}:withPippe`);
    }

    /**
     *
     */
    beforeEach(() => {
        PipeHandler.instance.clear();
        PipeHandler.instance.add('pippe', new PipeMock());
    });

    /**
     *
     */
    it('using one pipe', () => {
        const replacedValue = sut.replace('--${replacer:a | pippe}--');
        expect(replacedValue).toBe('--a--:withPippe');
    });

    /**
     *
     */
    it('using two pipes', () => {
        const replacedValue = sut.replace('--${replacer:a | pippe | pippe}--');
        expect(replacedValue).toBe('--a--:withPippe:withPippe');
    });

    /**
     *
     */
    it('wrong pipes', () => {
        expect(() => sut.replace('--${replacer:a | pippes}--')).toThrowError(`pipe 'pippes' does not exist\n--> '\${replacer:a | pippes}'`);
    });
});
