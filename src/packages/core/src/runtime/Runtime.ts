import fs from 'fs';
import { EnvLoader } from '../common/EnvLoader';
import { LocalContext } from './LocalContext';
import { RuntimeContext } from './RuntimeContext';
import { StepContext } from './StepContext';
import { TestContext } from './TestContext';
import { RuntimeNotifier } from './RuntimeNotifier';
import { Observable, Subject } from 'rxjs';
import { ArraySubject } from '../common/ArraySubject';

/**
 *
 */

export class Runtime {
    public stepRuntime = new RuntimeNotifier<StepContext>(() => new StepContext());
    public testRuntime = new RuntimeNotifier<TestContext>(() => new TestContext());
    public localRuntime = new RuntimeNotifier<LocalContext>(() => new LocalContext());
    public runtime = new RuntimeNotifier<RuntimeContext>(() => new RuntimeContext(), false);
    private readonly _language: ArraySubject<string>;

    /**
     *
     */
    private constructor() {
        this._language = new ArraySubject<string>();
    }

    /**
     *
     */
    private initialize() {
        this.localRuntime.onStart().subscribe((context) => this.runtime.currentContext.localContext.push(context));
        this.testRuntime.onStart().subscribe((context) => this.localRuntime.currentContext.testContext.push(context));
        this.stepRuntime.onStart().subscribe((context) => this.testRuntime.currentContext.stepContext.push(context));
    }

    /**
     *
     */
    static get instance(): Runtime {
        if (!globalThis._runtimeInstance) {
            const instance = new Runtime();
            globalThis._runtimeInstance = instance;
            instance.initialize();
        }
        return globalThis._runtimeInstance;
    }

    /**
     *
     */
    get language(): Subject<string> {
        return this._language;
    }

    /**
     *
     */
    save(filename?: string) {
        const data: string = JSON.stringify(this.runtime.currentContext);
        filename = filename || EnvLoader.instance.mapReportData(`boart-runtime-data.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFileSync(filename, data, 'utf-8');
    }
}
