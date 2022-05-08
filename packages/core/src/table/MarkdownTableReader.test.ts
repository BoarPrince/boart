import assert from 'assert';
import { MarkdownTableReader } from './MarkdownTableReader';

/**
 *
 */
it('default table with one column, header and one row', () => {
    const result = MarkdownTableReader.convert(
        `|h1|
             |-|
             |a|`
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1']);
    expect(result.rows).toEqual([{ cells: ['a'] }]);
});

/**
 *
 */
it('default table with one column, header and two rows', () => {
    const result = MarkdownTableReader.convert(
        `|h1|
         |-|
         |a|
         |b|`
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1']);
    expect(result.rows).toEqual([{ cells: ['a'] }, { cells: ['b'] }]);
});

/**
 *
 */
it('default table with two columns, header and two rows', () => {
    const result = MarkdownTableReader.convert(
        `|h1|h2|
         |- |- |
         |a1|a2|
         |b1|b2|`
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1', 'h2']);
    expect(result.rows).toEqual([{ cells: ['a1', 'a2'] }, { cells: ['b1', 'b2'] }]);
});

/**
 *
 */
it('default table with two columns, header and two rows and empty lines (begining)', () => {
    const result = MarkdownTableReader.convert(
        `
            
             |h1|h2|
             |- |- |
             |a1|a2|
             |b1|b2|`
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1', 'h2']);
    expect(result.rows).toEqual([{ cells: ['a1', 'a2'] }, { cells: ['b1', 'b2'] }]);
});

/**
 *
 */
it('default table with two columns, header and two rows and empty lines (end)', () => {
    const result = MarkdownTableReader.convert(
        `|h1|h2|
         |- |--|
         |a1|a2|
         |b1|b2|
             
             
             `
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1', 'h2']);
    expect(result.rows).toEqual([{ cells: ['a1', 'a2'] }, { cells: ['b1', 'b2'] }]);
});

/**
 *
 */
it('default table with two columns, header and two rows and containing escaped pipe', () => {
    const result = MarkdownTableReader.convert(
        `|h1   |h2|
         |-----|--|
         |a1   |a2|
         |b\\|1|b2|`
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1', 'h2']);
    expect(result.rows).toEqual([{ cells: ['a1', 'a2'] }, { cells: ['b|1', 'b2'] }]);
});

/**
 *
 */
it('default table with two columns, header and two rows and containing three escaped pipes', () => {
    const result = MarkdownTableReader.convert(
        `|h1       |h2   |
         |---------|-----|
         |a1       |a2   |
         |b\\|1\\|2|b\\|2|`
    );

    expect(result.headers).toBeDefined();
    expect(result.headers.cells).toStrictEqual(['h1', 'h2']);
    expect(result.rows).toEqual([{ cells: ['a1', 'a2'] }, { cells: ['b|1|2', 'b|2'] }]);
});

/**
 *
 */
it('table with wrong row', () => {
    try {
        MarkdownTableReader.convert(
            `|h1       |h2   |
             |---------|-----|
             |a1       |a2   |
             wrong
             |b1       |b2   |`
        );
    } catch (error) {
        expect(error.message).toBe('row: ==>> wrong <<== is not a markdown row');
        return;
    }

    assert.fail('error must be thrown if table is not correct');
});
