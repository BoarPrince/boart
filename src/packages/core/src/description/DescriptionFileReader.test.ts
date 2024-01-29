import * as fs from 'fs';

import { ASTUnitDescription } from '../parser/ast/ASTDescription';
import { DescriptionFileReader } from './DescriptionFileReader';

/**
 *
 */
jest.mock('fs');
jest.spyOn(fs, 'readFileSync').mockImplementation((fileName: string) => fileName);
jest.spyOn(fs, 'existsSync').mockReturnValue(true);

/**
 *
 */
const astDesc: ASTUnitDescription = {
    unit: '--unit--',
    desc: {
        id: '--id--',
        title: '--title--',
        titleShort: '--title--',
        desc: ['desc1', 'desc2'],
        examples: [
            {
                title: '--example1--',
                codes: [
                    {
                        title: '--code--',
                        type: 'json',
                        position: 'before',
                        code: ['code1', 'code2'],
                        location: null
                    }
                ],
                text: ['example1', 'example2'],
                location: null
            }
        ],
        location: null
    }
};

/**
 *
 */
// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('../parser/DescriptionParser', () => ({
    DescriptionParser: class {
        parse = jest.fn().mockImplementation((fileName: string) => {
            return fileName === 'path/desc.desc' ? astDesc.desc : [astDesc];
        });
    }
}));

/**
 *
 */
const sut = new DescriptionFileReader();

/**
 *
 */
describe('ast to desc', () => {
    /**
     *
     */
    it('simple desc', () => {
        const result = sut.readDescription('path/desc');
        expect(result).toStrictEqual({
            dataScopes: null,
            description: 'desc1\ndesc2',
            examples: [
                {
                    codes: [
                        {
                            code: 'code1\ncode2',
                            position: 'before',
                            title: '--code--',
                            titleShort: '--code--',
                            type: 'json'
                        }
                    ],
                    example: 'example1\nexample2',
                    title: '--example1--'
                }
            ],
            id: '--id--',
            parentId: null,
            title: '--title--',
            titleShort: '--title--'
        });
    });

    /**
     *
     */
    it('unit', () => {
        const result = sut.readDescription('path/unit-file', '--unit--');
        expect(result).toStrictEqual({
            dataScopes: null,
            description: 'desc1\ndesc2',
            examples: [
                {
                    codes: [
                        {
                            code: 'code1\ncode2',
                            position: 'before',
                            title: '--code--',
                            titleShort: '--code--',
                            type: 'json'
                        }
                    ],
                    example: 'example1\nexample2',
                    title: '--example1--'
                }
            ],
            id: '--id--',
            parentId: null,
            title: '--title--',
            titleShort: '--title--'
        });
    });

    /**
     *
     */
    it('unit but no definition', () => {
        expect(() => sut.readDescription('path/unit')).toThrow(
            "description of file 'path/unit.desc' is a unit description, but unit definition is missing"
        );
    });

    /**
     *
     */
    it('use correct filename', () => {
        var existsMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

        sut.readDescription(__filename, '--unit--');

        expect(existsMock.mock.lastCall[0]).toEndWith('DescriptionFileReader.test.desc');
    });

    /**
     *
     */
    it('take default path', () => {
        const existsMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

        sut.readDescription('Documentation', '--unit--');

        expect(existsMock.mock.lastCall[0]).toEndWith('Documentation.desc');
    });

    /**
     *
     */
    it('use .desc ending', () => {
        const existsMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

        sut.readDescription('Documentation.desc', '--unit--');

        expect(existsMock.mock.lastCall[0]).toEndWith('Documentation.desc');
    });
});
