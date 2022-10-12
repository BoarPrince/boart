import fs from 'fs';

import { EnvLoader } from './EnvLoader';
import { UrlLoader } from './UrlLoader';

jest.mock('fs');
jest.mock('./EnvLoader', () => ({
    EnvLoader: class {
        static instance = {
            getValueIndex: jest.fn().mockReturnValue(0),
            isDockerEnvironment: () => false
        };
    }
}));

/**
 *
 */
describe('check url loader', () => {
    process.env.environment_default_location = '<root>';
    process.env.environment_project_location = 'env';

    /**
     *
     */
    beforeEach(() => {
        delete globalThis._urlLoaderInstance;
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '/api/a/': 'http://service-a/'
                }
            })
        );
    });

    /**
     *
     */
    it('check getAbsolutePath (leading slash)', () => {
        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('/api/a/b');
        expect(path).toBe('http://service-a/api/a/b');
    });

    /**
     *
     */
    it('check localhost when running in docker', () => {
        EnvLoader.instance.isDockerEnvironment = () => true;
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '/api/a/': 'http://localhost:8000/'
                }
            })
        );

        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('/api/a/b');
        expect(path).toBe('http://host.docker.internal:8000/api/a/b');
    });

    /**
     *
     */
    it('check getAbsolutePath (no leading slash)', () => {
        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('api/a/b');
        expect(path).toBe('http://service-a/api/a/b');
    });

    /**
     *
     */
    it('check getAbsolutePath (check different service with same start)', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '/api/a/': 'http://service-a/',
                    '/api/b': 'http://service-b/'
                }
            })
        );

        const sut = UrlLoader.instance;

        let path = sut.getAbsoluteUrl('/api/a/b');
        expect(path).toBe('http://service-a/api/a/b');

        path = sut.getAbsoluteUrl('/api/b/b');
        expect(path).toBe('http://service-b/api/b/b');
    });

    /**
     *
     */
    it('check settings containing arrays', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '/api/a/': ['http://service-a/'],
                    '/api/b': 'http://service-b/'
                }
            })
        );

        const sut = UrlLoader.instance;

        let path = sut.getAbsoluteUrl('/api/a/b');
        expect(path).toBe('http://service-a/api/a/b');

        path = sut.getAbsoluteUrl('/api/b/b');
        expect(path).toBe('http://service-b/api/b/b');
    });

    /**
     *
     */
    it('check getAbsolutePath (check different service, but same service name starts)', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '<a>/api': 'http://service-a/',
                    '<b>/api': 'http://service-b/'
                }
            })
        );

        const sut = UrlLoader.instance;

        let path = sut.getAbsoluteUrl('<a>/api/a/b');
        expect(path).toBe('http://service-a/api/a/b');

        path = sut.getAbsoluteUrl('<b>/api/b/b');
        expect(path).toBe('http://service-b/api/b/b');
    });

    /**
     *
     */
    it('check getAbsolutePath (check different service, but same service name starts, no path)', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '<a>': 'http://service-a/',
                    '<b>': 'http://service-b/'
                }
            })
        );

        const sut = UrlLoader.instance;

        let path = sut.getAbsoluteUrl('<a>/api/a/b');
        expect(path).toBe('http://service-a/api/a/b');

        path = sut.getAbsoluteUrl('<b>/api/b/b');
        expect(path).toBe('http://service-b/api/b/b');
    });

    /**
     *
     */
    it('check empty environment', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({}));

        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('<a>/api/a/b');
        expect(path).toBe('/api/a/b');
    });

    /**
     *
     */
    it('check error while reading environment', () => {
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw Error('cant read');
        });

        try {
            UrlLoader.instance;
        } catch (error) {
            expect(error.message).toBe(`can't read environment (path_mapping) settings [<root>]: "cant read"`);
            return;
        }

        throw Error('error must be thrown if environemnt cant be read');
    });

    /**
     *
     */
    it('check without mapping', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {}
            })
        );

        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('http://api/a/b');
        expect(path).toBe('http://api/a/b');
    });

    /**
     *
     */
    it('default value must be used, because requested env does not exists', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '<a>': ['http://service-a0/', 'http://service-a1/']
                }
            })
        );
        jest.spyOn(EnvLoader.instance, 'getValueIndex').mockReturnValue(2);

        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('<a>/api/a/b');
        expect(path).toBe('http://service-a0/api/a/b');
    });

    /**
     *
     */
    it('use existing environment value', () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({
                path_mapping: {
                    '<a>': ['http://service-a0/', 'http://service-a1/']
                }
            })
        );
        jest.spyOn(EnvLoader.instance, 'getValueIndex').mockReturnValue(1);

        const sut = UrlLoader.instance;

        const path = sut.getAbsoluteUrl('<a>/api/a/b');
        expect(path).toBe('http://service-a1/api/a/b');
    });
});
