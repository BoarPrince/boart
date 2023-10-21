import { ParaDescription } from '../pipe/ParaDescription';
import { Pipe } from '../pipe/Pipe';
import { PipeHandler } from '../pipe/PipeHandler';
import { Store } from '../store/Store';
import { ScopeType } from '../types/ScopeType';
import { ScopedType } from '../types/ScopedType';

import { ValueReplaceArg, ValueReplacer, ValueReplacerConfig } from './ValueReplacer';
import { ValueReplacerHandler } from './ValueReplacerHandler';
import { ValueResolver } from './ValueResolver';

/**
 *
 */
type ReplaceResult = string | null | undefined;

/**
 *
 */
const valueReplacerHandlerMock = (returnValue = '#', config: ValueReplacerConfig = {}, scoped = ScopedType.true, priority = 100) => {
    const replacer: {
        handler: ValueReplacerHandler;
        replacer: ValueReplacer;
    } = {} as never;

    replacer.handler = {
        get: (name: string): ValueReplacer => {
            if (returnValue === '#') {
                replacer.replacer = new ValueReplacerMock();
            } else {
                replacer.replacer = new ValueReplacerCustimizeMock(returnValue, scoped, config, priority, name);
            }
            return replacer.replacer;
        }
    } as never;
    return replacer;
};

/**
 *
 */
class ValueReplacerMock implements ValueReplacer {
    config = {};
    get name() {
        return 'ValueReplacerMock';
    }
    priority = 100;
    scoped = ScopedType.true;
    replace = jest.fn((): ReplaceResult => null);
    replace2 = jest.fn((arg: ValueReplaceArg): ReplaceResult => {
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
        public scoped,
        public config,
        public priority,
        public name
    ) {}
    replace = jest.fn((): ReplaceResult => this.returnValue);
    replace2 = jest.fn((): ReplaceResult => this.returnValue);
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
it('deep 1', () => {
    const replacedValue = sut.replace('--${replacer:a:"${replacer:b}"}--');
    expect(replacedValue).toBe('--a:b:--');
});

/**
 *
 */
it('multiple 1', () => {
    const replacedValue = sut.replace('--${replacer:a}--${replacer:b}--');
    expect(replacedValue).toBe('--a--b--');
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
it('deep 3', () => {
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
    expect(mock.replacer.replace2).toHaveBeenCalledWith(expect.anything(), null);
});

/**
 *
 */
it('step store is default scope', () => {
    const mock = valueReplacerHandlerMock('', { defaultScopeType: ScopeType.Step });
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toHaveBeenCalledWith(expect.anything(), Store.instance.stepStore);
});

/**
 *
 */
it('when no scope is defined, take default scope - local', () => {
    const mock = valueReplacerHandlerMock('', { defaultScopeType: ScopeType.Test });
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toHaveBeenCalledWith(expect.anything(), Store.instance.testStore);
});

/**
 *
 */
it('when no scope is defined, take default scope - global', () => {
    const mock = valueReplacerHandlerMock('', { defaultScopeType: ScopeType.Global });
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer:a}');
    expect(mock.replacer.replace2).toHaveBeenCalledWith(expect.anything(), Store.instance.globalStore);
});

/**
 *
 */
it('defined scope must be used', () => {
    const mock = valueReplacerHandlerMock('', { defaultScopeType: ScopeType.Test });
    sut = new ValueResolver(mock.handler);

    sut.replace('${replacer@g:a}');
    expect(mock.replacer.replace2).toHaveBeenCalledWith(expect.anything(), Store.instance.globalStore);
});

/**
 *
 */
it('wrong scope is used', () => {
    const mock = valueReplacerHandlerMock('', { defaultScopeType: ScopeType.Test });
    sut = new ValueResolver(mock.handler);

    expect(() => sut.replace('${replacer@z:a}')).toThrow('Expected [ \\t] or [glts] but "z" found.\n${replacer@ -> z <- :a}');
});

/**
 *
 */
it('replacer does not expect a scope', () => {
    const mock = valueReplacerHandlerMock('', { defaultScopeType: ScopeType.Test, scopeAllowed: false });
    sut = new ValueResolver(mock.handler);

    expect(() => sut.replace('${replacer@t:a}')).toThrow('scope not allowed: ${replacer -> @t <- :a}\n${replacer@t:a}');
});

/**
 *
 */
it('replacer needs at least one selector', () => {
    const mock = valueReplacerHandlerMock('xxx', { defaultScopeType: ScopeType.Test, scopeAllowed: false, selectorsCountMin: 1 });
    sut = new ValueResolver(mock.handler);

    expect(() => sut.replace('${replacer:a}')).toThrow('at least 1 selector(s) are required, but only 0 exists: ${replacer:a}');
});

/**
 *
 */
it('replacer cannot have too much selectors', () => {
    const mock = valueReplacerHandlerMock('xxx', { defaultScopeType: ScopeType.Test, scopeAllowed: false, selectorsCountMax: 2 });
    sut = new ValueResolver(mock.handler);

    expect(() => sut.replace('${replacer:a#a.b.c.d.e.f}')).toThrow('max 2 selector(s) allowed, but 6 found: ${replacer:a#a.b.c.d.e.f}');
});

/**
 *
 */
describe('default', () => {
    /**
     *
     */
    beforeEach(() => {
        Store.instance.globalStore.clear();
        Store.instance.localStore.clear();
        Store.instance.testStore.clear();
        Store.instance.stepStore.clear();
    });

    /**
     *
     */
    it('default defined, but not needed', () => {
        const mock = valueReplacerHandlerMock('xxx', { defaultScopeType: ScopeType.Test });
        sut = new ValueResolver(mock.handler);

        const replacedValue = sut.replace('${replacer:a :- "bbb"}');
        expect(replacedValue).toBe('xxx');
    });

    /**
     *
     */
    it('default assignment needs at least one selector', () => {
        const mock = valueReplacerHandlerMock(null, { defaultScopeType: ScopeType.Test });
        sut = new ValueResolver(mock.handler);

        expect(() => sut.replace('${replacer:a := "aaa"}')).toThrow(
            `selector is required in case of default assignment: \${replacer:a  -> := "aaa"\n\${replacer:a := "aaa"}`
        );
    });

    /**
     *
     */
    it('default assignment must additionally put the value to the store', () => {
        const mock = valueReplacerHandlerMock(null, { defaultScopeType: ScopeType.Test });
        sut = new ValueResolver(mock.handler);

        const replacedValue = sut.replace('${replacer#a:=bbb}');
        expect(replacedValue).toBe('bbb');
        expect(Store.instance.testStore.get('a').valueOf()).toBe('bbb');
    });
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
        expect(() => sut.replace('--${replacer:a | pippes}--')).toThrow(`pipe 'pippes' does not exist\n--> '\${replacer:a | pippes}'`);
    });
});
