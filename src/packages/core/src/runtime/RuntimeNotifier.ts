import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';
import { Timer } from '../common/Timer';
import { RuntimeResultContext } from './RuntimeResultContext';

/**
 *
 */
export class RuntimeNotifier<TContext extends RuntimeResultContext> {
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
    constructor(
        private contextGenerator: () => TContext,
        private preserveCurrent = true
    ) {}

    /**
     *
     */
    public notifyStart(context: TContext) {
        const generatedContext = this.contextGenerator();
        // remove all undefined properties to prevent overriding with the spread operator
        Object.keys(generatedContext).forEach((key) => generatedContext[key] === undefined && delete generatedContext[key]);

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
        if (context) {
            this.currentContext.endTime = this.timer.endTime;
            this.currentContext.duration = this.timer.duration;
            this.currentContext.status = context.status;
            this.currentContext.errorMessage = context.errorMessage;
            this.currentContext.stackTrace = context.stackTrace;
        }

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
