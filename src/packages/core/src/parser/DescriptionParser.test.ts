import { DescriptionParser } from './DescriptionParser';
import { ASTDescription, ASTUnitDescription } from './ast/ASTDescription';

/**
 *
 */
const sut = new DescriptionParser();

/**
 *
 */
describe('only one description', () => {
    /*
     *
     */
    it('small', () => {
        const description = `
        # expected
        ## id.1
        desc1
        desc2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            desc: ['        desc1', '        desc2'],
            examples: [],
            id: 'id.1',
            location: undefined,
            title: 'id.1'
        });
    });

    /*
     *
     */
    it('small with empty new lines', () => {
        const description = `
        # expected

        ## -id-

        desc1

        desc2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            desc: ['', '        desc1', '', '        desc2'],
            examples: [],
            id: '-id-',
            location: undefined,
            title: '-id-'
        });
    });

    /*
     *
     */
    it('with one example', () => {
        const description = `
        # expected
        ## id.1
        desc1
        desc2
        ### Example: ex.1
        example1
        example2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            desc: ['        desc1', '        desc2'],
            examples: [
                {
                    codes: [],
                    location: undefined,
                    text: ['        example1', '        example2'],
                    title: 'ex.1'
                }
            ],
            id: 'id.1',
            location: undefined,
            title: 'id.1'
        });
    });

    /*
     *
     */
    it('with one codes, whitout meta', () => {
        const description = `
      # expected
      ## id.1
      desc1
      desc2
      ### example: ex.1
      example1
      example2
      #### code: Response Body
      code1
      code2`;

        const ast = sut.parse(description) as ASTDescription;

        expect(ast.examples).toBeArrayOfSize(1);
        expect(ast.examples[0].codes).toBeArrayOfSize(1);
        expect(ast.examples[0].codes[0].title).toBe('Response Body');
        expect(ast.examples[0].codes[0].type).toBe('json');
        expect(ast.examples[0].codes[0].position).toBe('after');
        expect(ast.examples[0].codes[0].code).toBeArrayOfSize(2);
        expect(ast.examples[0].codes[0].code[0]).toBe('      code1');
        expect(ast.examples[0].codes[0].code[1]).toBe('      code2');
    });

    /*
     *
     */
    it('with two codes, whitout meta', () => {
        const description = `
      # expected
      ## id.1
      desc1
      desc2
      ### example: ex.1
      example1
      example2
      #### code: Response Body 1
      code1-1
      code1-2
      #### code: Response Body 2 (position: after, type: text)
      code2-1
      code2-2`;

        const ast = sut.parse(description) as ASTDescription;

        expect(ast.examples).toBeArrayOfSize(1);
        expect(ast.examples[0].codes).toBeArrayOfSize(2);
        expect(ast.examples[0].codes[0].title).toBe('Response Body 1');
        expect(ast.examples[0].codes[1].title).toBe('Response Body 2');
        expect(ast.examples[0].codes[1].type).toBe('text');
        expect(ast.examples[0].codes[1].position).toBe('after');
        expect(ast.examples[0].codes[1].code).toBeArrayOfSize(2);
        expect(ast.examples[0].codes[1].code[0]).toBe('      code2-1');
        expect(ast.examples[0].codes[1].code[1]).toBe('      code2-2');
    });

    /*
     *
     */
    it('with two units', () => {
        const description = `
        # expected
        ## id.1
        desc1-1
        desc1-2
        ## id.2
        desc2-1
        desc2-2`;

        const ast = sut.parse(description) as ReadonlyArray<ASTUnitDescription>;

        expect(ast).toBeArrayOfSize(2);
        expect(ast[0].unit).toBe('id.1');
        expect(ast[1].unit).toBe('id.2');
        expect(ast[1].desc.desc).toBeArrayOfSize(2);
        expect(ast[1].desc.desc[0].trim()).toBe('desc2-1');
        expect(ast[1].desc.desc[1].trim()).toBe('desc2-2');
    });

    /*
     *
     */
    it('with comments', () => {
        const description = `
        # expected
--------------------
        ## id.1
--------------------
        desc1-1
        desc1-2

--------------------
        ## id.2
--------------------
        desc2-1
        desc2-2`;

        const ast = sut.parse(description) as ReadonlyArray<ASTUnitDescription>;

        expect(ast).toBeArrayOfSize(2);
        expect(ast[0].unit).toBe('id.1');
        expect(ast[1].unit).toBe('id.2');
        expect(ast[1].desc.desc).toBeArrayOfSize(2);
        expect(ast[1].desc.desc[0].trim()).toBe('desc2-1');
        expect(ast[1].desc.desc[1].trim()).toBe('desc2-2');
    });
});

/**
 *
 */
describe('with errors', () => {
    /**
     *
     */
    it('check missing desc', () => {
        const description = `
        # expected
        desc1-1
        desc1-2`;

        expect(() => sut.parse(description)).toThrow('at least one description must be defined');
    });

    /**
     *
     */
    it('check code definition', () => {
        const description = `
        # expected
        ## id.1
        desc1
        ### example: ex.1
        example1
        #### code: Response Body (type: test)
        code1-1`;

        expect(() => sut.parse(description)).toThrow(`code definition not known 'type:test'`);
    });
});
