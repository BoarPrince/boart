import fs from 'fs';

import { TemplateHandler } from './TemplateHandler';

/**
 *
 */
beforeEach(() => {
    delete globalThis._templateHandlerInstance;

    jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
        JSON.stringify({
            template_mapping: {
                t1: 'xxx',
                t2: {
                    t21: 'yyyy'
                }
            }
        })
    );
});

/**
 *
 */
it('default', () => {
    const sut = TemplateHandler.instance;
    expect(sut.get('t1')).toBe('xxx');
});

/**
 *
 */
it('default - deep', () => {
    const sut = TemplateHandler.instance;
    expect(sut.get('t2.t21')).toBe('yyyy');
});

/**
 *
 */
it('default - not found', () => {
    const sut = TemplateHandler.instance;
    expect(sut.get('t3')).toBeUndefined();
});

/**
 *
 */
it('definition not defined', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify({}));

    const sut = TemplateHandler.instance;
    expect(sut.get('t3')).toBeUndefined();
});

/**
 *
 */
it('wrong definition', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() =>
        JSON.stringify({
            template_mapping: {
                t1: 2
            }
        })
    );

    const sut = TemplateHandler.instance;
    expect(sut.get('t1')).toBeUndefined();
});
