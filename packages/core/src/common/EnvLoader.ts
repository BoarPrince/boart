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
    public get projectRoot(): string {
        return process.env.environment_project_root || '.';
    }

    /**
     *
     */
    public get defaultLocation(): string {
        return process.env.environment_default_location || 'env/environment.json';
    }

    /**
     *
     */
    public set defaultLocation(location: string) {
        process.env['environment_default_location'] = location;
    }

    /**
     *
     */
    public get projectLocation(): string {
        return process.env.environment_project_location;
    }

    /**
     *
     */
    public set projectLocation(location: string) {
        process.env['environment_project_location'] = location;
    }

    /**
     *
     */
    private static readSettings(filename: string): Record<string, EnvironmentValue> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const fileData: string = fs.readFileSync(filename, { encoding: 'utf-8' });
        const settings = JSON.parse(fileData) as EnvironmentSettings;
        return { ...settings.system, ...settings.environment } as Record<string, EnvironmentValue>;
    }

    /**
     *
     */
    private initialize() {
        // read default settings
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        this.initMapping(EnvLoader.readSettings(fsPath.join(this.projectRoot, this.defaultLocation)));

        // add or override project specific settings
        if (!!this.projectLocation) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
            this.initMapping(EnvLoader.readSettings(fsPath.join(this.projectRoot, this.projectLocation)));
        }
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
}
