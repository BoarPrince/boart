import { ConfigurationLookup } from './ConfigurationLookup';
import mockFs from 'mock-fs';

/**
 *
 */
beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    mockFs({
        '/boart': {
            extensions: {
                'just-a-file.1.json': 'file content here',
                'just-a-file.2.json': 'file content here',
                'rest-call': {
                    'just-a-file.3.json': 'file content here',
                    'just-a-file.4.json': 'file content here',
                    'boart.json': 'boar-configuration',
                    'boart.ext1.json': 'boar-configuration',
                    'boart.ext2.json': 'boar-configuration'
                },
                'rabbitmq-bind': {
                    'boart.json': 'boar-configuration',
                    'boart.ext.json': 'boar-configuration'
                }
            },
            boart: {
                extensions: {
                    'sql-query': {
                        'boart.json': 'boar-configuration',
                        'boart.ext1.json': 'boar-configuration',
                        'boart.ext2.json': 'boar-configuration'
                    }
                }
            }
        }
    });
});

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
afterAll(() => mockFs.restore());

/**
 *
 */
describe('one path', () => {
    /**
     *
     */
    test('wrong path', () => {
        const sut = new ConfigurationLookup('/boart/extension');
        expect(() => sut.lookup()).toThrow("Read configuration: path '/boart/extension' does not exist");
    });

    /**
     *
     */
    test('number of files must be correct', () => {
        const sut = new ConfigurationLookup('/boart/extensions');
        const files = sut.lookup();

        expect(files).toBeArrayOfSize(5);
    });

    /**
     *
     */
    test('name of the file must be correct', () => {
        const sut = new ConfigurationLookup('/boart/extensions');
        const files = sut.lookup();

        expect(files[0]).toBe('/boart/extensions/rabbitmq-bind/boart.ext.json');
        expect(files[1]).toBe('/boart/extensions/rabbitmq-bind/boart.json');
    });
});

/**
 *
 */
describe('two paths', () => {
    /**
     *
     */
    test('number of files must be correct', () => {
        const sut = new ConfigurationLookup('/boart/extensions, /boart/boart/extensions');
        const files = sut.lookup();

        expect(files).toBeArrayOfSize(8);
    });
});
