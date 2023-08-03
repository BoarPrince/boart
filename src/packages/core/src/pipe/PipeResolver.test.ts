import { ParaDescription } from './ParaDescription';
import { Pipe } from './Pipe';
import { PipeHandler } from './PipeHandler';
import { PipeResolver } from './PipeResolver';

/**
 *
 */
class PipeMock implements Pipe {
    name = 'mock';
    constructor(public paraDesc?: ParaDescription[]) {}
    run = jest.fn(
        (value: string, arg1: string, arg2: number, arg3: boolean): string => `${value}:${arg1 || '-'}:${arg2 || '-'}:${arg3 || '-'}`
    );
}

/**
 *
 */
let sut: PipeResolver;

/**
 *
 */
beforeEach(() => {
    PipeHandler.instance.clear();
    PipeHandler.instance.add('mock', new PipeMock());

    sut = new PipeResolver();
});

/**
 *
 */
it('pipe does not exists', () => {
    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock-x',
            pipes: [
                {
                    name: 'mock-x',
                    paras: null
                }
            ]
        })
    ).toThrowError(`pipe 'mock-x' does not exist`);
});

/**
 *
 */
it('paras is null', () => {
    const result = sut.resolve('xxx', {
        match: 'xxx | mock',
        pipes: [
            {
                name: 'mock',
                paras: null
            }
        ]
    });

    expect(result).toBe('xxx:-:-:-');
});

/**
 *
 */
it('paras is not defined', () => {
    const result = sut.resolve('xxx', {
        match: 'xxx',
        pipes: null
    });

    expect(result).toBe('xxx');
});

/**
 *
 */
it('paras is empty', () => {
    const result = sut.resolve('xxx', {
        match: 'xxx | mock',
        pipes: [
            {
                name: 'mock',
                paras: []
            }
        ]
    });

    expect(result).toBe('xxx:-:-:-');
});

/**
 *
 */
it('with paramter, but no definition', () => {
    const result = sut.resolve('xxx', {
        match: 'xxx | mock',
        pipes: [
            {
                name: 'mock',
                paras: ['1', '2', '3']
            }
        ]
    });

    expect(result).toBe('xxx:1:2:3');
});

/**
 *
 */
it('using two pipes', () => {
    const result = sut.resolve('xxx', {
        match: 'xxx | mock | mock',
        pipes: [
            {
                name: 'mock',
                paras: ['1', '2', '3']
            },
            {
                name: 'mock',
                paras: ['4', '5', '6']
            }
        ]
    });

    expect(result).toBe('xxx:1:2:3:4:5:6');
});

/**
 *
 */
it('with paramter and definition - number', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'string'
        },
        {
            desc: 'second para',
            type: 'number'
        },
        {
            desc: 'thhird para',
            type: 'string'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    const result = sut.resolve('xxx', {
        match: 'xxx | mock',
        pipes: [
            {
                name: 'mock',
                paras: ['1', '2', '3']
            }
        ]
    });

    expect(result).toBe('xxx:1:2:3');
    expect(pipeMock.run).toBeCalledWith('xxx', '1', 2, '3');
});

/**
 *
 */
it('with paramter and definition - boolean', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'string'
        },
        {
            desc: 'second para',
            type: 'string'
        },
        {
            desc: 'thhird para',
            type: 'boolean'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    const result = sut.resolve('xxx', {
        match: 'xxx | mock',
        pipes: [
            {
                name: 'mock',
                paras: ['1', '2', 'true']
            }
        ]
    });

    expect(result).toBe('xxx:1:2:true');
    expect(pipeMock.run).toBeCalledWith('xxx', '1', '2', true);
});

/**
 *
 */
it('wrong boolean parameter', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'boolean'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: ['1']
                }
            ]
        })
    ).toThrowError(`Error: para #0'first para' must be a boolean, but has the value '1'\n--> 'xxx | mock'`);
});

/**
 *
 */
it('wrong number parameter', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'number'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: ['true']
                }
            ]
        })
    ).toThrowError(`Error: para #0'first para' must be a number, but has the value 'true'\n--> 'xxx | mock'`);
});

/**
 *
 */
it('parameter list not correct - 1', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'number'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: null
                }
            ]
        })
    ).toThrowError(`Error: 1 para(s) expected, but 0 found\n--> 'xxx | mock'`);
});

/**
 *
 */
it('parameter list not correct - 2', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'number'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: []
                }
            ]
        })
    ).toThrowError(`Error: 1 para(s) expected, but 0 found\n--> 'xxx | mock'`);
});

/**
 *
 */
it('parameter list not correct - 3', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'string'
        },
        {
            desc: 'second para',
            type: 'string'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: ['1']
                }
            ]
        })
    ).toThrowError(`Error: 2 para(s) expected, but 1 found\n--> 'xxx | mock'`);
});

/**
 *
 */
it('parameter list not correct - 4', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([
        {
            desc: 'first para',
            type: 'string'
        }
    ]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: ['1', '2']
                }
            ]
        })
    ).toThrowError(`Error: 1 para(s) expected, but 2 found\n--> 'xxx | mock'`);
});

/**
 *
 */
it('parameter list not correct - 5', () => {
    PipeHandler.instance.clear();
    const pipeMock = new PipeMock([]);
    PipeHandler.instance.add('mock', pipeMock);

    expect(() =>
        sut.resolve('xxx', {
            match: 'xxx | mock',
            pipes: [
                {
                    name: 'mock',
                    paras: ['1', '2']
                }
            ]
        })
    ).toThrowError(`Error: 0 para(s) expected, but 2 found\n--> 'xxx | mock'`);
});
