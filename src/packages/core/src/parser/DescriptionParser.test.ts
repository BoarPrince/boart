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
        const description = `: id: -id-
       : description:
          desc1
          desc2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            desc: ['          desc1', '          desc2'],
            examples: null,
            id: '-id-'
        });
    });

    /*
     *
     */
    it('small with empty new lines', () => {
        const description = `

       : id: -id-

       : description:

          desc1

          desc2
      `;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            desc: ['', '          desc1', '', '          desc2', '      '],
            examples: null,
            id: '-id-'
        });
    });

    /*
     *
     */
    it('small with no leading space', () => {
        const description = `
: id: -id-
: description:
desc1
desc2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            desc: ['desc1', 'desc2'],
            examples: null,
            id: '-id-'
        });
    });

    /*
     *
     */
    it('with one example', () => {
        const description = `
        : id: -id-
        : examples:
        :: example:
        ::: title: string
        ::: text:
            example1
            example2
        ::: codes:
        :::: code:
        ::::: title: string
        ::::: type: json
        ::::: position: before
        ::::: code:
            code1
            code2
        : description:
            desc1
            desc2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            id: '-id-',
            desc: [
                '            desc1',
                '            desc2'],
            examples: [
              {
                    title: 'string',
                    text: [
                        '            example1',
                        '            example2'
                      ],
                    codes: [
                        {
                            title: 'string',
                            type: 'json',
                            position: 'before',
                            code: [
                                '            code1',
                                '            code2'
                            ]
                        }
                    ]
                }
            ]
        });
    });

    /*
     *
     */
    it('with one example and empty new lines', () => {
        const description = `

        : id: -id-

        : examples:

        :: example:

        ::: title: string

        ::: text:

            example1

            example2

        ::: codes:

        :::: code:

        ::::: title: string

        ::::: type: json

        ::::: position: before

        ::::: code:

            code1

            code2

        : description:

            desc1

            desc2

            `;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual({
            id: '-id-',
            desc: [
                '',
                '            desc1',
                '',
                '            desc2',
                '',
                '            '
            ],
            examples: [
              {
                    title: 'string',
                    text: [
                        '',
                        '            example1',
                        '',
                        '            example2',
                        '',
                    ],
                    codes: [
                        {
                            title: 'string',
                            type: 'json',
                            position: 'before',
                            code: [
                                '',
                                '            code1',
                                '',
                                '            code2',
                                ''
                            ]
                        }
                    ]
                }
            ]
        });
    });

    /*
     *
     */
    it('with two codes', () => {
      const description = `
        : id: -id-
        : examples:
        :: example:
        ::: title: string
        ::: text:
            example1
            example2
        ::: codes:
        :::: code:
        ::::: title: string
        ::::: type: json
        ::::: position: before
        ::::: code:
            code1-1
            code1-2
        :::: code:
        ::::: title: string2
        ::::: type: json
        ::::: position: before
        ::::: code:
            code2-1
            code2-2
        : description:
            desc1
            desc2`;

      const ast = sut.parse(description) as ASTDescription;

      expect(ast.examples).toBeArrayOfSize(1);
      expect(ast.examples[0].codes).toBeArrayOfSize(2);
      expect(ast.examples[0].codes[1].title).toBe('string2');
      expect(ast.examples[0].codes[1].code).toBeArrayOfSize(2);
      expect(ast.examples[0].codes[1].code[0]).toBe('            code2-1')
    });

    /*
     *
     */
    it('with two examples', () => {
      const description = `
        : id: -id-
        : description:
            desc1
            desc2
        : examples:
        :: example:
        ::: title: title-1
        ::: text:
            example1-1
            example1-2
        ::: codes:
        :::: code:
        ::::: title: string
        ::::: type: json
        ::::: position: before
        ::::: code:
            code1-1
            code1-2
        :: example:
        ::: title: title-2
        ::: text:
            example2-1
            example2-2
      `;

      const ast = sut.parse(description) as ASTDescription;

      expect(ast.examples).toBeArrayOfSize(2);
      expect(ast.examples[0].title).toBe('title-1');
      expect(ast.examples[0].text).toBeArrayOfSize(2);
      expect(ast.examples[0].text[0]).toBe('            example1-1');
      expect(ast.examples[0].text[1]).toBe('            example1-2');
    });
});

/**
 *
 */
describe('with multiple description', () => {
    /*
     *
     */
    it('small and only one', () => {
        const description = `
        --- unit-1 ---
       : id: -id-
       : description:
          desc1
          desc2`;

        const ast = sut.parse(description);

        expect(ast).toStrictEqual([
          {
            "desc":
            {
              "desc":
              [
                  "          desc1",
                  "          desc2"
              ],
              "examples": null,
              "id": "-id-"
            },
            "unit": "unit-1"
          }]
        );
    });

    /*
     *
     */
    it('small and two units', () => {
        const description = `
          --- unit-1 ---
          : id: -id-
          : description:
              desc1-1
              desc1-2
          --- unit-2 ---
          : id: -id-
          : examples:
          :: example:
          ::: title: string
          ::: text:
              example1
              example2
          ::: codes:
          :::: code:
          ::::: title: string2
          ::::: type: json
          ::::: position: before
          ::::: code:
              code2-1
              code2-2
          : description:
              desc1
              desc2`;

        const ast = sut.parse(description) as ReadonlyArray<ASTUnitDescription>;

        expect(ast).toBeArray();
        expect(ast).toBeArrayOfSize(2);

        expect(ast[0].unit).toBe('unit-1')
        expect(ast[1].unit).toBe('unit-2')

        expect(ast[0].desc.desc).toBeArrayOfSize(2);
        expect(ast[0].desc.desc[0].trimStart()).toBe('desc1-1');
        expect(ast[0].desc.desc[1].trimStart()).toBe('desc1-2');
    });
});

/**
 *
 */
describe('with errors', () => {
  /**
   *
   */
  it('wrong token', () => {
      const description = `
          : descriptio:
              desc1
              desc2
          : id: -id-`;

      expect(() => sut.parse(description)).toThrow(`Expected '-- <unit> --', ': id :', or whitespaces (including new line) but \":\" found.`);
  });

  /**
   *
   */
  it('missing token', () => {
    const description = `
        : description:
            desc1
            desc2
        : id: -id-`;

    expect(() => sut.parse(description)).toThrow(`-- <unit> --', ': id :', or whitespaces (including new line) but \":\" found.`);
});
});
