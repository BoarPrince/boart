import { randomUUID } from 'crypto';

import { Observable, Subject } from 'rxjs';

import { Timer } from '../common/Timer';

import { LocalContext, RuntimeContext, RuntimeResultContext, StepContext, TestContext } from './RuntimeContext';

/**
 *
 */
class RuntimeNotifier<TContext extends RuntimeResultContext> {
    private timer: Timer;
    private start = new Subject<TContext>();
    private end = new Subject<RuntimeResultContext>();
    public onStart = (): Observable<TContext> => this.start;
    public onEnd = (): Observable<RuntimeResultContext> => this.end;
    public current: TContext;

    /**
     *
     */
    constructor(context: TContext, private preserveCurrent = true) {
        this.current = {
            id: randomUUID(),
            ...this.current,
            ...context
        };
    }

    /**
     *
     */
    public notifyStart(context: TContext) {
        this.timer = new Timer();
        this.current = {
            startTime: this.timer.startTime,
            ...this.current,
            ...context
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
}

/**
 *
 */
export class Runtime {
    public stepRuntime = new RuntimeNotifier<StepContext>(new StepContext());
    public testRuntime = new RuntimeNotifier<TestContext>(new TestContext());
    public localRuntime = new RuntimeNotifier<LocalContext>(new LocalContext());
    public runtime = new RuntimeNotifier<RuntimeContext>(new RuntimeContext(), false);

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

        this.runtime.onEnd().subscribe(() => {
            console.log('runtime', JSON.stringify(this.runtime.current, null, '  '));
        });
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
}
