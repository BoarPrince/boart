import * as fs from 'fs';

import { Description, FullDescription } from '@boart/core';

import { ExpectedConverter } from './ExpectedConverter';
import { DescriptionGenerator } from './DescriptionGenerator';

/**
 *
 */
jest.mock('fs');
const writeMock = jest.spyOn(fs, 'writeFileSync');

/**
 *
 */
jest.mock('@boart/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@boart/core');

    return {
        __esModule: true,
        ...originalModule,
        EnvLoader: class {
            static getSettings = jest.fn().mockReturnValue({});
            static instance = {
                mapDescriptionData: (filename: string) => filename,
                mapDataFileName: (filename: string) => filename
            };
        }
    };
});

/**
 *
 */
beforeEach(() => {
    delete globalThis._descriptionConverterInstance;
});

/**
 *
 */
xdescribe('convert', () => {
    /**
     *
     */
    it('ref found one time', () => {
        jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
            JSON.stringify({
                expected: {
                    desc: {
                        id: 'exp:equal',
                        title: '-title-',
                        description: 'is for *bold*',
                        examples: null
                    },
                    operators: new Array<Description>()
                },
                tableHandlers: null,
                replacer: null
            } as FullDescription)
        );

        const sut = DescriptionGenerator.instance;
        // const result = sut.mapReference('<a href="ref:exp:equal">ref:exp:equal</a>');
        const result = '';
        expect(result).toBe('<a href="expected.html#exp:equal">-title-</a>');
    });
});

/**
 *
 */
describe('expected', () => {
    /**
     *
     */
    // it('expected', () => {
    //     const expected = {
    //         desc: {
    //             id: '-id-',
    //             title: '-title-',
    //             description: 'is for *bold*',
    //             examples: null
    //         },
    //         operators: new Array<Description>()
    //     };
    //     const sut = new ExpectedConverter(expected);
    //     sut.convert();
    //     expect(writeMock).toHaveBeenCalled();
    //     expect(writeMock).toHaveBeenCalledWith('description.json', JSON.stringify(''));
    // });
});
