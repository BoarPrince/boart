import * as fs from 'fs';

import { ExpectedOperatorResult } from '../expected/ExpectedOperator';
import { ExpectedOperatorInitializer } from '../expected/ExpectedOperatorInitializer';

import { DescriptionHandler } from './DescriptionHandler';
import { FullDescription } from './FullDescription';

/**
 *
 */
/**
 *
 */
jest.mock('fs');
jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
    JSON.stringify({
        environment: {
            environment_data_dir: 'data'
        }
    })
);
const writeMock = jest.spyOn(fs, 'writeFileSync');

/**
 *
 */
let basicFullDescription: FullDescription;

/**
 *
 */
beforeEach(() => {
    delete globalThis._descriptionHandlerInstance;

    basicFullDescription = {
        tableHandlers: [],
        expected: {
            desc: {
                id: '07c83a77-e3b1-400f-9966-2b7460f4c86a',
                title: 'expected:operation:initializer',
                description: 'xxx',
                examples: null
            },
            operators: []
        },
        replacer: null
    };
});

/**
 *
 */
it('save basic description', () => {
    const sut = DescriptionHandler.instance;

    sut.save();

    expect(writeMock).toHaveBeenCalled();
    expect(writeMock).toHaveBeenCalledWith('data/description.json', JSON.stringify(basicFullDescription));
});

/**
 *
 */
it('save description with expected operator', () => {
    const sut = DescriptionHandler.instance;

    ExpectedOperatorInitializer.instance.addOperator({
        name: 'equals',
        description: {
            id: '988aca13-41a6-402c-843f-62b20b7d2640',
            title: 'expected:equals',
            description: `* item 1
                          * item 2`,
            examples: []
        },
        canCaseInsesitive: true,
        check: (): ExpectedOperatorResult => ({
            result: true
        })
    });

    sut.save();

    basicFullDescription.expected.operators = [
        {
            id: '988aca13-41a6-402c-843f-62b20b7d2640',
            title: 'expected:equals',
            description: '* item 1\n* item 2',
            examples: []
        }
    ];

    expect(writeMock).toHaveBeenCalled();
    expect(writeMock).toHaveBeenCalledWith('data/description.json', JSON.stringify(basicFullDescription));
});
