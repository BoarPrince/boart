import { randomUUID } from 'crypto';
import fs from 'fs';

import { Observable, Subject } from 'rxjs';

import { EnvLoader } from '../common/EnvLoader';
import { Timer } from '../common/Timer';

import { LocalContext } from './LocalContext';
import { RuntimeResultContext } from './RuntimeContext';
import { RuntimeContext } from './RuntimeContext.1';
import { StepContext } from './StepContext';
import { TestContext } from './TestContext';

/**
 *
 */
class RuntimeNotifier<TContext extends RuntimeResultContext> {
    private timer: Timer;
    private start = new Subject<TContext>();
    private end = new Subject<RuntimeResultContext>();
    private clear = new Subject<void>();
    public onStart = (): Observable<TContext> => this.start;
    public onEnd = (): Observable<RuntimeResultContext> => this.end;
    public onClear = (): Observable<void> => this.clear;
    public currentContext: TContext;

    /**
     *
     */
    constructor(private contextGenerator: () => TContext, private preserveCurrent = true) {}

    /**
     *
     */
    public notifyStart(context: TContext) {
        const generatedContext = this.contextGenerator();
        // remove all undefined properties to prevent overriding with the spread operator
        Object.keys(generatedContext).forEach(key => generatedContext[key] === undefined && delete generatedContext[key]);

        this.timer = new Timer();
        this.currentContext = {
            ...generatedContext,
            ...context,
            startTime: this.timer.startTime,
            id: randomUUID()
        };
        this.start.next(this.currentContext);
    }

    /**
     *
     */
    public notifyEnd(context: RuntimeResultContext) {
        this.currentContext.endTime = this.timer.endTime;
        this.currentContext.duration = this.timer.duration;
        this.currentContext.status = context.status;
        this.currentContext.errorMessage = context.errorMessage;
        this.currentContext.stackTrace = context.stackTrace;
        this.end.next(this.currentContext);
        if (!this.preserveCurrent) {
            this.currentContext = null;
        }
    }

    /**
     *
     */
    public notifyClear() {
        this.clear.next();
    }
}

/**
 *
 */
export class Runtime {
    public stepRuntime = new RuntimeNotifier<StepContext>(() => new StepContext());
    public testRuntime = new RuntimeNotifier<TestContext>(() => new TestContext());
    public localRuntime = new RuntimeNotifier<LocalContext>(() => new LocalContext());
    public runtime = new RuntimeNotifier<RuntimeContext>(() => new RuntimeContext(), false);

    /**
     *
     */
    private constructor() {
        // hide constructor externally
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
    save(filename?: string) {
        const data: string = JSON.stringify(this.runtime.currentContext);
        filename = filename || EnvLoader.instance.mapReportData(`boart-runtime-data.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFileSync(filename, data, 'utf-8');
    }
}
