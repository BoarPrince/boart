import { RunDefinitionParser } from './RunDefinitionParser';
/**
 *
 */
it('default - without args', () => {
    const result = RunDefinitionParser.parse('a,b ,c,d');
    expect(result).toEqual([
        { args: {}, name: 'a' },
        { args: {}, name: 'b' },
        { args: {}, name: 'c' },
        { args: {}, name: 'd' }
    ]);
});

/**
 *
 */
it('empty def', () => {
    const result = RunDefinitionParser.parse('');
    expect(result).toEqual([]);
});

/**
 *
 */
it('null def', () => {
    const result = RunDefinitionParser.parse(null);
    expect(result).toEqual([]);
});

/**
 *
 */
it('undefined def', () => {
    const result = RunDefinitionParser.parse(undefined);
    expect(result).toEqual([]);
});

/**
 *
 */
it('def - only with default args', () => {
    const result = RunDefinitionParser.parse('::1:2:: a, b');
    expect(result).toEqual([
        {
            args: {
                arg1: '1',
                arg2: '2'
            },
            name: 'a'
        },
        {
            args: {
                arg1: '1',
                arg2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('def - only with named default args', () => {
    const result = RunDefinitionParser.parse('::1@para1:2@para2:: a, b');
    expect(result).toEqual([
        {
            args: {
                para1: '1',
                para2: '2'
            },
            name: 'a'
        },
        {
            args: {
                para1: '1',
                para2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('override first named default arg - first para', () => {
    const result = RunDefinitionParser.parse('::1@para1:2@para2:: a:3@para1, b');
    expect(result).toEqual([
        {
            args: {
                para1: '3',
                para2: '2'
            },
            name: 'a'
        },
        {
            args: {
                para1: '1',
                para2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('override first named default arg - both paras', () => {
    const result = RunDefinitionParser.parse('::1@para1:2@para2:: a:3@para1, b:4@para1');
    expect(result).toEqual([
        {
            args: {
                para1: '3',
                para2: '2'
            },
            name: 'a'
        },
        {
            args: {
                para1: '4',
                para2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('override named default arg - both paras', () => {
    const result = RunDefinitionParser.parse('::1@para1:2@para2:: a:3@para1:5@para2, b:4@para1');
    expect(result).toEqual([
        {
            args: {
                para1: '3',
                para2: '5'
            },
            name: 'a'
        },
        {
            args: {
                para1: '4',
                para2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('override named default arg - add arg', () => {
    const result = RunDefinitionParser.parse('::1@para1:2@para2::, a:3@para3, b');
    expect(result).toEqual([
        {
            args: {
                para1: '1',
                para2: '2',
                para3: '3'
            },
            name: 'a'
        },
        {
            args: {
                para1: '1',
                para2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('override first default arg - first para', () => {
    const result = RunDefinitionParser.parse('::1:2:: a:3, b');
    expect(result).toEqual([
        {
            args: {
                arg1: '3',
                arg2: '2'
            },
            name: 'a'
        },
        {
            args: {
                arg1: '1',
                arg2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('override first default arg - both paras', () => {
    const result = RunDefinitionParser.parse('::1:2:: a:3, b:4');
    expect(result).toEqual([
        {
            args: {
                arg1: '3',
                arg2: '2'
            },
            name: 'a'
        },
        {
            args: {
                arg1: '4',
                arg2: '2'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('mixed args, default is named', () => {
    const result = RunDefinitionParser.parse('::1@para1:2:: a:3, b:4');
    expect(result).toEqual([
        {
            args: {
                arg2: '2',
                para1: '3'
            },
            name: 'a'
        },
        {
            args: {
                arg2: '2',
                para1: '4'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('mixed args, default is named, override second too', () => {
    const result = RunDefinitionParser.parse('::1@para1:2:: a:3, b:4:5');
    expect(result).toEqual([
        {
            args: {
                arg2: '2',
                para1: '3'
            },
            name: 'a'
        },
        {
            args: {
                arg2: '5',
                para1: '4'
            },
            name: 'b'
        }
    ]);
});

/**
 *
 */
it('mixed args, default is named, override second name', () => {
    const result = RunDefinitionParser.parse('::1@para1:2@para2:: a:3, b:5@para2');
    expect(result).toEqual([
        {
            args: {
                para1: '3',
                para2: '2'
            },
            name: 'a'
        },
        {
            args: {
                para1: '1',
                para2: '5'
            },
            name: 'b'
        }
    ]);
});
