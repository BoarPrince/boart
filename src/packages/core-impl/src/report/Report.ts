import { EnvLoader } from '@boart/core';

/**
 *
 */
export class Report {
    private _projectName: string;
    private _environment: string;

    private static _instance: Report;

    /**
     *
     */
    private constructor() {
        this._environment = EnvLoader.instance.getEnvironment();
        this._projectName = EnvLoader.instance.getProjectName();
    }

    /**
     *
     */
    public static get instance(): Report {
        if (!Report._instance) {
            Report._instance = new Report();
        }
        return Report._instance;
    }

    /**
     *
     */
    public report(): void {
        console.message(
            `##report##${JSON.stringify({
                projectName: this._projectName,
                environment: this._environment
            })}`
        );
    }

    /**
     *
     */
    public setEnvironment(value: string) {
        this._environment = value;
    }

    /**
     *
     */
    public setProjectName(value: string) {
        this._projectName = value;
    }
}
