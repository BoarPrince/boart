'use strict';

import fs from 'fs';
import fsPath from 'path';

import { compare } from 'compare-versions';

import { RuntimeEnvironment } from '../types/RuntimeEnvironment';

/**
 *
 */
type EnvironmentValue = readonly string[] | string;

/**
 *
 */
export interface EnvironmentSettings {
    readonly environment?: Record<string, EnvironmentValue>;
    readonly system?: Record<string, EnvironmentValue>;
}

/**
 *
 */
export class EnvLoader {
    private isDocker?: boolean;

    /**
     *
     */
    private constructor(private readonly currentVersion: string) {
        this.isDocker = undefined;
    }

    /**
     *
     */
    static get version(): string {
        return process.env.npm_package_version;
    }

    /**
     *
     */
    static get instance(): EnvLoader {
        if (!globalThis._envLoaderInstance) {
            const instance = new EnvLoader(EnvLoader.version);
            globalThis._envLoaderInstance = instance;
            instance.initialize();
        }
        return globalThis._envLoaderInstance;
    }

    /**
     *
     */
    public checkMinVersion(): string {
        if (compare(this.currentVersion, this.minVersion, '<')) {
            throw Error(`current version is ${this.currentVersion}, but it must be at least ${this.minVersion}`);
        }
        return this.minVersion;
    }

    /**
     *
     */
    public get minVersion(): string {
        return this.get('min_version') || EnvLoader.version;
    }

    /**
     *
     */
    public getEnvironment(): RuntimeEnvironment {
        return process.env.runtime_environent as RuntimeEnvironment;
    }

    /**
     *
     */
    public getProjectName(): string {
        return this.get('project_name') || process.env.npm_package_name || '<project_name>';
    }

    /**
     *
     */
    public static get projectRoot(): string {
        const path = process.env.environment_project_root || '.';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (fsPath.isAbsolute(path)) {
            return path;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return fsPath.resolve(path);
        }
    }

    /**
     *
     */
    public static get defaultLocation(): string {
        return process.env.environment_default_location || 'env/environment.json';
    }

    /**
     *
     */
    public static set defaultLocation(location: string) {
        process.env['environment_default_location'] = location;
    }

    /**
     *
     */
    public static get projectLocation(): string {
        return process.env.environment_project_location;
    }

    /**
     *
     */
    public static set projectLocation(location: string) {
        process.env['environment_project_location'] = location;
    }

    /**
     *
     */
    private static readSettings(filename: string): object {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const fileData: string = fs.readFileSync(filename, { encoding: 'utf-8' });
        return JSON.parse(fileData);
    }

    /**
     *
     */
    public static getSettings<T>(): T {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        const defaultSettings = EnvLoader.readSettings(fsPath.join(EnvLoader.projectRoot, EnvLoader.defaultLocation));

        // add or override project specific settings
        if (!!EnvLoader.projectLocation) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
            const projectSettings = EnvLoader.readSettings(fsPath.join(EnvLoader.projectRoot, EnvLoader.projectLocation));
            return EnvLoader.mergeDeep(defaultSettings, projectSettings) as unknown as T;
        } else {
            return defaultSettings as unknown as T;
        }
    }

    /**
     *
     */
    private initialize() {
        const settings = EnvLoader.getSettings<EnvironmentSettings>();
        const envSettings = { ...settings.system, ...settings.environment } as Record<string, EnvironmentValue>;
        this.initMapping(envSettings);
    }

    /**
     *
     */
    public get(key: string, defaultValue = '', check = false): string {
        const envValue = process.env[key];
        if (envValue == null && check === true) {
            throw new Error(`environment 'env:${key}' does not exists`);
        }
        return envValue || defaultValue;
    }

    /**
     *
     */
    public getValueIndex(): number {
        switch (process.env.runtime_environent as RuntimeEnvironment) {
            case RuntimeEnvironment.Staging:
                return 1;
            case RuntimeEnvironment.Local:
                return 2;
            case RuntimeEnvironment.Prod:
            case RuntimeEnvironment.Production:
                return 3;
            default:
                return 0;
        }
    }

    /**
     *
     */
    private initMapping(settings: Record<string, EnvironmentValue>) {
        const valueIndex = this.getValueIndex();

        Object.entries(settings)
            .map(([key, value]) => [key, Array.isArray(value) ? value[valueIndex] || value[0] : value])
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .forEach(([key, value]) => (process.env[key] = value));
    }

    /**
     *
     */
    private mapPath(filename: string, dirVar: string): string {
        if (!filename) {
            throw new Error('filename must be defined');
        }
        const dataDir = this.get(dirVar);
        if (!dataDir) {
            throw new Error(`cannot map environment "${dirVar}"`);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!fs.existsSync(dataDir)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return fsPath.join(dataDir, filename);
    }

    /**
     *
     */
    public mapDataFileName(filename: string): string {
        return this.mapPath(filename, 'environment_data_dir');
    }

    /**
     *
     */
    public mapReportData(filename: string): string {
        return this.mapPath(filename, 'environment_reports_data_dir');
    }

    /**
     *
     */
    public isDockerEnvironment(): boolean {
        if (!this.isDocker) {
            const hasDockerEnv = () => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    fs.statSync('/.dockerenv');
                    return true;
                } catch (_) {
                    return false;
                }
            };

            const hasDockerCGroup = (): boolean => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
                } catch (_) {
                    return false;
                }
            };

            this.isDocker = hasDockerEnv() || hasDockerCGroup();
        }

        return this.isDocker;
    }

    /**
     *
     */
    public static mergeDeep(...objects: object[]): object {
        const isObject = (obj: unknown) => obj && !Array.isArray(obj) && typeof obj === 'object';

        return objects.reduce((part, result) => {
            Object.keys(result).forEach((key) => {
                const partValue = part[key] as unknown;
                const resultValue = result[key] as unknown;

                if (isObject(partValue) && isObject(resultValue)) {
                    part[key] = EnvLoader.mergeDeep(partValue as object, resultValue as object);
                } else {
                    part[key] = resultValue;
                }
            });

            return part;
        }, {});
    }
}
