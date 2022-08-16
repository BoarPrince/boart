import fs from 'fs';

import { RuntimeEnvironment } from '../types/RuntimeEnvironment';

import { EnvironmentSettings, EnvLoader } from './EnvLoader';

/**
 *
 */
jest.mock('fs');

/**
 *
 */
describe('check env loader', () => {
    /**
     *
     */
    const mockDataDefault: EnvironmentSettings = {
        environment: {
            valueNoEnv: 'value'
        },
        system: {
            min_version: '1.1.2',
            project_name: 'p.name'
        }
    };

    /**
     *
     */
    const mockDataProject: EnvironmentSettings = {
        environment: {
            withStaging: ['dev', 'stage'],
            withLocal: ['dev', 'stage', 'local'],
            withProd: ['dev', 'stage', 'local', 'prod']
        },
        system: {
            min_version: '1.1.2',
            project_name: 'p.name'
        }
    };

    /**
     *
     */
    beforeEach(() => {
        process.env.environment_project_root = '<root>';
        process.env.npm_package_version = '1.1.2';
        process.env.npm_package_name = 'p_name_env';
        process.env.environment_default_location = 'default.location';
        process.env.environment_project_location = 'project.location';

        fs.readFileSync = jest.fn();
    });

    afterEach(() => {
        globalThis._envLoaderInstance = null;
        process.env = {};
    });

    /**
     *
     */
    describe('with pre-initialize', () => {
        /**
         *
         */
        beforeEach(() => {
            (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                return path === process.env.environment_project_root + '/' + process.env.environment_default_location
                    ? JSON.stringify(mockDataDefault)
                    : JSON.stringify(mockDataProject);
            });
        });

        /**
         *
         */
        it('check with undefined root/path settings', () => {
            process.env = {};
            fs.readFileSync = jest.fn(() =>
                JSON.stringify({
                    environment: {
                        valueNoEnv: 'default-value'
                    }
                })
            ) as jest.Mock;

            const sut = EnvLoader.instance;

            expect(fs.readFileSync).toBeCalledWith('env/environment.json', { encoding: 'utf-8' });
            expect(sut.get('valueNoEnv')).toBe('default-value');
            expect(sut.get('withStaging')).toBe('');
        });

        /**
         *
         */
        it('check default initialization', () => {
            const sut = EnvLoader.instance;

            expect(sut.get('valueNoEnv')).toBe('value');
            expect(sut.get('withStaging')).toBe('dev');
        });

        /**
         *
         */
        it('check unknown key (check false)', () => {
            const sut = EnvLoader.instance;

            const result = sut.get('x');

            expect(result).toBe('');
        });

        /**
         *
         */
        it('check unknown key (check true)', () => {
            const sut = EnvLoader.instance;

            try {
                sut.get('x', '', true);
            } catch (error) {
                expect(error.message).toBe(`environment 'env:x' does not exists`);
                return;
            }

            throw Error('error must occur try to fetch a wrong key with active check');
        });

        /**
         *
         */
        it('check unknown key (with default value)', () => {
            const sut = EnvLoader.instance;

            const result = sut.get('x', 'y');

            expect(result).toBe('y');
        });

        /**
         *
         */
        it('request environment', () => {
            const sut = EnvLoader.instance;

            process.env.runtime_environent = 'dev';

            const result = sut.getEnvironment();

            expect(result).toBe('dev');
        });

        /**
         *
         */
        it('request project name (is defined in environment)', () => {
            const sut = EnvLoader.instance;

            const result = sut.getProjectName();

            expect(result).toBe('p.name');
        });

        /**
         *
         */
        it('get staging environment', () => {
            process.env.runtime_environent = RuntimeEnvironment.Staging;
            const sut = EnvLoader.instance;

            const result = sut.get('withStaging');

            expect(result).toBe('stage');
        });

        /**
         *
         */
        it('get local environment', () => {
            process.env.runtime_environent = RuntimeEnvironment.Local;
            const sut = EnvLoader.instance;

            const result = sut.get('withLocal');

            expect(result).toBe('local');
        });

        /**
         *
         */
        it('get prod environment', () => {
            process.env.runtime_environent = RuntimeEnvironment.Prod;
            const sut = EnvLoader.instance;

            const result = sut.get('withProd');

            expect(result).toBe('prod');
        });
    });

    describe('without pre-initialize', () => {
        /**
         *
         */
        it('check min version (not defined)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));

            const sut = EnvLoader.instance;
            const result = sut.checkMinVersion();

            expect(process.env.npm_package_version).toBe('1.1.2');
            expect(result).toBe('1.1.2');
        });

        /**
         *
         */
        it('check min version (equal)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() =>
                JSON.stringify({
                    system: {
                        min_version: '1.1.2'
                    }
                } as EnvironmentSettings)
            );

            const sut = EnvLoader.instance;
            const result = sut.checkMinVersion();

            expect(process.env.npm_package_version).toBe('1.1.2');
            expect(result).toBe('1.1.2');
        });

        /**
         *
         */
        it('check min version (smaller)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() =>
                JSON.stringify({
                    system: {
                        min_version: '1.1.1'
                    }
                } as EnvironmentSettings)
            );
            const sut = EnvLoader.instance;
            const result = sut.checkMinVersion();

            expect(process.env.npm_package_version).toBe('1.1.2');
            expect(result).toBe('1.1.1');
        });

        /**
         *
         */
        it('check min version (greater)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() =>
                JSON.stringify({
                    system: {
                        min_version: '1.1.3'
                    }
                })
            );
            const sut = EnvLoader.instance;
            try {
                expect(process.env.npm_package_version).toBe('1.1.2');
                sut.checkMinVersion();
            } catch (error) {
                expect(error.message).toBe(`current version is 1.1.2, but it must be at least 1.1.3`);
                return;
            }

            throw Error('error must be thrown if the expected min version does not fit to the current version');
        });

        /**
         *
         */
        it('request project name (is not defined in environment)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));

            const sut = EnvLoader.instance;

            const result = sut.getProjectName();

            expect(result).toBe('p_name_env');
        });

        /**
         *
         */
        it('request project name (is not defined in environment and not in npm_package_name)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            process.env.npm_package_name = '';

            const sut = EnvLoader.instance;

            const result = sut.getProjectName();

            expect(result).toBe('<project_name>');
        });

        /**
         *
         */
        it('map data path (path does not exist)', () => {
            process.env.environment_data_dir = '<data-dir>';
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            fs.existsSync = jest.fn(() => false);
            fs.mkdirSync = jest.fn();

            const sut = EnvLoader.instance;

            const result = sut.mapDataFileName('<data-file>');

            expect(result).toBe('<data-dir>/<data-file>');
            expect(fs.mkdirSync).toBeCalledTimes(1);
        });

        /**
         *
         */
        it('map data path (path already exists)', () => {
            process.env.environment_data_dir = '<data-dir>';
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            fs.existsSync = jest.fn(() => true);
            fs.mkdirSync = jest.fn();

            const sut = EnvLoader.instance;

            const result = sut.mapDataFileName('<data-file>');

            expect(result).toBe('<data-dir>/<data-file>');
            expect(fs.mkdirSync).not.toBeCalled();
        });

        /**
         *
         */
        it('map data path (empty file name)', () => {
            process.env.environment_data_dir = '<data-dir>';
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            fs.existsSync = jest.fn(() => true);
            fs.mkdirSync = jest.fn();

            const sut = EnvLoader.instance;

            try {
                sut.mapDataFileName('');
            } catch (error) {
                expect(error.message).toBe(`filename must be defined`);
                return;
            }

            throw Error('error must thrown if no file name is defined');
        });

        /**
         *
         */
        it('map report path', () => {
            process.env.environment_reports_data_dir = '<report-path>';
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            fs.existsSync = jest.fn(() => true);
            fs.mkdirSync = jest.fn();

            const sut = EnvLoader.instance;

            const result = sut.mapReportData('<report-file>');

            expect(result).toBe('<report-path>/<report-file>');
        });

        /**
         *
         */
        it('no default location definition', () => {
            delete process.env.environment_default_location;
            // process.env.environment_project_location = undefined;

            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            fs.existsSync = jest.fn(() => true);
            fs.mkdirSync = jest.fn();

            const sut = EnvLoader.instance;

            expect(sut.defaultLocation).toBe('env/environment.json');
            expect(fs.readFileSync).toBeCalledTimes(2);
            expect(fs.readFileSync).nthCalledWith(1, '<root>/env/environment.json', { encoding: 'utf-8' });
            expect(fs.readFileSync).nthCalledWith(2, '<root>/project.location', { encoding: 'utf-8' });
        });

        /**
         *
         */
        it('no project location definition', () => {
            delete process.env.environment_project_location;

            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            fs.existsSync = jest.fn(() => true);
            fs.mkdirSync = jest.fn();

            const sut = EnvLoader.instance;

            expect(sut.defaultLocation).toBe('default.location');
            expect(fs.readFileSync).toBeCalledTimes(1);
            expect(fs.readFileSync).nthCalledWith(1, '<root>/default.location', { encoding: 'utf-8' });
        });

        /**
         *
         */
        it('check docker (docker env exists)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            (fs.statSync as jest.Mock).mockImplementation();
            // (fs.statSync as jest.Mock).mockImplementation(() => {
            //     throw Error('');
            // });

            const sut = EnvLoader.instance;

            const result = sut.isDockerEnvironment();

            expect(result).toBeTruthy();
        });

        /**
         *
         */
        it('check docker (docker env does not exist)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
            (fs.statSync as jest.Mock).mockImplementation(() => {
                throw Error('');
            });

            const sut = EnvLoader.instance;

            const result = sut.isDockerEnvironment();

            expect(result).toBeFalsy();
        });

        /**
         *
         */
        it('check docker (cgroup does not exist)', () => {
            (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
                if (path === '/proc/self/cgroup') {
                    throw Error('');
                } else {
                    return JSON.stringify({});
                }
            });
            (fs.statSync as jest.Mock).mockImplementation(() => {
                throw Error('');
            });

            const sut = EnvLoader.instance;

            const result = sut.isDockerEnvironment();

            expect(result).toBeFalsy();
        });
    });
});
