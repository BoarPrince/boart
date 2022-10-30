import { EnvLoader } from '@boart/core';

/**
 *
 */
type TemplateValueType = Record<string, TemplateValue>;

/**
 *
 */
export interface TemplateValue {
    value: string | TemplateValueType;
}

/**
 *
 */
export interface TemplateSettings {
    readonly template_mapping?: TemplateValueType;
}

/**
 *
 */
export class TemplateHandler {
    /**
     *
     */
    private templates: Record<string, string> = {};

    /**
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    static get instance(): TemplateHandler {
        if (!globalThis._templateHandlerInstance) {
            const instance = new TemplateHandler();
            globalThis._templateHandlerInstance = instance;
            instance.initialize();
        }

        return globalThis._templateHandlerInstance;
    }

    /**
     *
     */
    get(key: string): string {
        return this.templates[key];
    }

    /**
     *
     */
    private initialize() {
        const settings = EnvLoader.getSettings<TemplateSettings>();
        this.templates = this.parseSettings(settings.template_mapping);
    }

    /**
     *
     */
    private parseSettings(settings: TemplateValueType): Record<string, string> {
        return Object.entries(settings || {}).reduce((obj, [key, value]) => {
            if (typeof value === 'string') {
                obj[key] = value;
            } else {
                Object.entries(this.parseSettings(value as unknown as TemplateValueType)).forEach(([k, v]) => {
                    obj[`${key}.${k}`] = v;
                });
            }
            return obj;
        }, {} as Record<string, string>);
    }
}
