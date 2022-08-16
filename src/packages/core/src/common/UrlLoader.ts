import fs from 'fs';

import { EnvLoader } from './EnvLoader';

/**
 *
 */
type PathValue = readonly string[] | string;

/**
 *
 */
export interface EnvironmentSettings {
    readonly path_mapping?: Record<string, PathValue>;
}

/**
 *
 */
export class UrlLoader {
    private static _instance: UrlLoader;
    private readonly pathMapping: Map<string, string>;

    /**
     *
     */
    private constructor() {
        this.pathMapping = new Map();
    }

    /**
     *
     */
    static get dockerLocal(): string {
        return 'host.docker.internal';
    }

    /**
     *
     */
    static get instance(): UrlLoader {
        if (!UrlLoader._instance) {
            UrlLoader._instance = new UrlLoader();
            UrlLoader._instance.initialize();
        }
        return UrlLoader._instance;
    }

    /**
     *
     */
    private initialize() {
        // global settings
        this.initMapping(this.readSettings(process.env.environment_default_location));

        // add or override project specific settings
        this.initMapping(this.readSettings(process.env.environment_project_location));
    }

    /**
     *
     */
    private readSettings(filename: string): Record<string, PathValue> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const fileData: string = fs.readFileSync(filename, 'utf-8');
            const settings = JSON.parse(fileData) as EnvironmentSettings;
            return settings.path_mapping || {};
        } catch (error) {
            throw Error(`can't read environment (path_mapping) settings [${filename}]: ${JSON.stringify(error.message)}`);
        }
    }

    /**
     * Development is the default environment and it is always first in the list, i.e. index 0.
     */
    private initMapping(settings: Record<string, PathValue>) {
        const valueIndex = EnvLoader.instance.getValueIndex();

        Object.entries(settings)
            .map(([key, value]) => [key, (Array.isArray(value) ? value[valueIndex] : value) as string])
            .forEach(([key, value]) => {
                this.pathMapping.set(key, value);
            });
    }

    /**
     *
     */
    getAbsoluteUrl(url: string): string {
        if (
            !!url &&
            !url.startsWith('<') &&
            !url.startsWith('/') &&
            !url?.toLowerCase().startsWith('http://') &&
            !url?.toLowerCase().startsWith('https://')
        ) {
            url = '/' + url;
        }

        const absoluteUrl = (
            Array.from(this.pathMapping.entries())
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([path, _]) => {
                    return url.startsWith(path);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map(([_, baseUrl]) => `${baseUrl}${url}`)
                .find(() => true) || url
        )
            .replace(/<[^<>]+>/, '')
            .replace(/([^:])\/\//g, '$1/');

        return EnvLoader.instance.isDockerEnvironment() === true
            ? absoluteUrl.replace(/([^\w])localhost([^\w])/, `$1${UrlLoader.dockerLocal}$2`)
            : absoluteUrl;
    }
}
