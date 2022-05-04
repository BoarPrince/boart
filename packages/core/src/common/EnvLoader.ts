'use strict';

import fs from 'fs';
import fsPath from 'path';

import compareVersions from 'compare-versions';

import { GaugeEnvironment } from '../types/GaugeEnvironment';

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
    private static _instance: EnvLoader;

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
        if (!EnvLoader._instance) {
            EnvLoader._instance = new EnvLoader(EnvLoader.version);
            EnvLoader._instance.initialize();
        }
        return EnvLoader._instance;
    }

    /**
     *
     */
    public checkMinVersion(): string {
        if (compareVersions(this.currentVersion, this.minVersion) < 0) {
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
    public getEnvironment(): GaugeEnvironment {
        return process.env.gauge_environment as GaugeEnvironment;
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
    private static readSettings(filename: string): Record<string, EnvironmentValue> {
        const fileData = fs.readFileSync(filename, 'utf-8');
        const settings = JSON.parse(fileData) as EnvironmentSettings;
        return { ...settings.system, ...settings.environment } as Record<string, EnvironmentValue>;
    }

    /**
     *
     */
    private initialize() {
        // read default settings
        this.initMapping(
            EnvLoader.readSettings(fsPath.join(process.env.GAUGE_PROJECT_ROOT || '', process.env.environment_default_location || ''))
        );

        // add or override project specific settings
        this.initMapping(
            EnvLoader.readSettings(fsPath.join(process.env.GAUGE_PROJECT_ROOT || '', process.env.environment_project_location || ''))
        );
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
        switch (process.env.gauge_environment as GaugeEnvironment) {
            case GaugeEnvironment.Staging:
                return 1;
            case GaugeEnvironment.Local:
                return 2;
            case GaugeEnvironment.Prod:
            case GaugeEnvironment.Production:
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
            .forEach(([key, value]) => {
                process.env[key] = value;
            });
    }

    /**
     *
     */
    private mapPath(filename: string, dirVar: string): string {
        if (!filename) {
            throw new Error('filename must be defined');
        }
        const dataDir = this.get(dirVar);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        return fsPath.join(dataDir, filename);
    }

    /**
     *
     */
    public mapDataFileName(filename: string): string {
        return this.mapPath(filename, 'gauge_data_dir');
    }

    /**
     *
     */
    public mapReportData(filename: string): string {
        return this.mapPath(filename, 'gauge_reports_data_dir');
    }

    /**
     *
     */
    public isDockerEnvironment(): boolean {
        if (!this.isDocker) {
            const hasDockerEnv = () => {
                try {
                    fs.statSync('/.dockerenv');
                    return true;
                } catch (_) {
                    return false;
                }
            };

            const hasDockerCGroup = (): boolean => {
                try {
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
