import { PropertyParser } from './PropertyParser';

/**
 *
 */
it('default', () => {
    const sut = PropertyParser.parseProperty('a.b.c');
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' }
    ]);
});

/**
 *
 */
it('empty', () => {
    const sut = PropertyParser.parseProperty('');
    expect(sut.toArray()).toEqual([]);
});

/**
 *
 */
it('null', () => {
    const sut = PropertyParser.parseProperty(null);
    expect(sut.toArray()).toEqual([]);
});

/**
 *
 */
it('last', () => {
    const sut = PropertyParser.parseProperty('a.b.c');
    const sutLast = sut.last();

    expect(sutLast).toEqual({ isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' });
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' }
    ]);
});

/**
 *
 */
it('not last', () => {
    const sut = PropertyParser.parseProperty('a.b.c');
    const sutNoLast = sut.noLast();

    expect(sutNoLast.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' }
    ]);

    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' }
    ]);
});

/**
 *
 */
it('first', () => {
    const sut = PropertyParser.parseProperty('a.b.c');
    const sutFirst = sut.first();

    expect(sutFirst).toEqual({ isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' });
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' }
    ]);
});

/**
 *
 */
it('not first', () => {
    const sut = PropertyParser.parseProperty('a.b.c');
    const sutNoFirst = sut.nofirst();

    expect(sutNoFirst.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' }
    ]);

    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b.c', key: 'c' }
    ]);
});

/**
 *
 */
it('optional', () => {
    const sut = PropertyParser.parseProperty('a.b?.c');
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b?.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: true, path: 'a.b?.c', key: 'b' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.b?.c', key: 'c' }
    ]);
});

/**
 *
 */
it('index', () => {
    const sut = PropertyParser.parseProperty('a[0].c');
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.0.c', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: true, isOptional: false, path: 'a.0.c', key: '0' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.0.c', key: 'c' }
    ]);
});

/**
 *
 */
it('optional index', () => {
    const sut = PropertyParser.parseProperty('a[0].c?');
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.0.c?', key: 'a' },
        { isArrayDefinition: false, isArrayIndex: true, isOptional: false, path: 'a.0.c?', key: '0' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: true, path: 'a.0.c?', key: 'c' }
    ]);
});

/**
 *
 */
it('index definition', () => {
    const sut = PropertyParser.parseProperty('a[*].c?');
    expect(sut.toArray()).toEqual([
        { isArrayDefinition: false, isArrayIndex: false, isOptional: false, path: 'a.*.c?', key: 'a' },
        { isArrayDefinition: true, isArrayIndex: false, isOptional: false, path: 'a.*.c?', key: '*' },
        { isArrayDefinition: false, isArrayIndex: false, isOptional: true, path: 'a.*.c?', key: 'c' }
    ]);
});
