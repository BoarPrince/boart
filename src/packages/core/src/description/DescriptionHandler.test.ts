import * as fs from 'fs';

import { ExpectedOperatorResult } from '../expected/ExpectedOperator';
import { ExpectedOperatorInitializer } from '../expected/ExpectedOperatorInitializer';

import { DescriptionHandler } from './DescriptionHandler';
import { FullDescription } from './FullDescription';

/**
 *
 */
jest.mock('fs');
jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
    JSON.stringify({
        environment: {
            environment_data_dir: 'data',
            environment_description_data_dir: 'desc'
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
    delete globalThis._expectedOperatorInitializer;

    ExpectedOperatorInitializer.instance.description = () => ({
        id: 'eq0',
        title: 'expected:operation:initializer',
        description: 'xxx',
        examples: null
    });

    basicFullDescription = {
        tableHandlers: [],
        expected: {
            desc: {
                id: 'eq0',
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

    expect(writeMock).toHaveBeenCalledWith('desc/description.json', JSON.stringify(basicFullDescription));
});

/**
 *
 */
it('save description with expected operator', () => {
    const sut = DescriptionHandler.instance;

    ExpectedOperatorInitializer.instance.addOperator({
        name: 'equals',
        description: () => ({
            id: 'eq1',
            title: 'expected:equals',
            description: `* item 1
                          * item 2`,
            examples: []
        }),
        caseInsesitive: true,
        check: (): ExpectedOperatorResult => ({
            result: true
        })
    });

    sut.save();

    basicFullDescription.expected.operators = [
        {
            id: 'eq1',
            title: 'expected:equals',
            description: '* item 1\n                          * item 2',
            examples: []
        }
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const content = JSON.parse(writeMock.mock.calls[0][1].toString());
    // check only the first operator
    content.expected.operators = [content.expected.operators[0]];

    expect(content).toStrictEqual(basicFullDescription);
});
