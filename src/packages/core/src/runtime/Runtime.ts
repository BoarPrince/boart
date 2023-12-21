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
    public current: TContext;

    /**
     *
     */
    constructor(private contextGenerator: () => TContext, private preserveCurrent = true) {}

    /**
     *
     */
    public notifyStart(context: TContext) {
        this.timer = new Timer();
        this.current = {
            ...context,
            ...this.contextGenerator(),
            startTime: this.timer.startTime,
            id: randomUUID(),
        };
        this.start.next(this.current);
    }

    /**
     *
     */
    public notifyEnd(context: RuntimeResultContext) {
        this.current.endTime = this.timer.endTime;
        this.current.duration = this.timer.duration;
        this.current.status = context.status;
        this.current.errorMessage = context.errorMessage;
        this.current.stackTrace = context.stackTrace;
        this.end.next(this.current);
        if (!this.preserveCurrent) {
            this.current = null;
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
        this.localRuntime.onStart().subscribe((context) => this.runtime.current.localContext.push(context));
        this.testRuntime.onStart().subscribe((context) => this.localRuntime.current.testContext.push(context));
        this.stepRuntime.onStart().subscribe((context) => this.testRuntime.current.stepContext.push(context));
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
        const data: string = JSON.stringify(this.runtime.current);
        filename = filename || EnvLoader.instance.mapReportData(`boart-runtime-data.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFileSync(filename, data, 'utf-8');
    }
}
