import { ArraySubject } from '@boart/core';
import { Observable } from 'rxjs';

import { ExpectedOperator } from './ExpectedOperator';

/**
 *
 */
export class ExpectedOperatorInitializer {
    private static readonly _instance = new ExpectedOperatorInitializer();
    private readonly _operators = new ArraySubject<ExpectedOperator>();

    /**
     *
     */
    static get instance(): ExpectedOperatorInitializer {
        return ExpectedOperatorInitializer._instance;
    }

    /**
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    public clear(): void {
        this._operators.clear();
    }

    /**
     *
     */
    public addOperator(operator: ExpectedOperator): void {
        this._operators.next(operator);
    }

    /**
     *
     */
    get operators(): Observable<ExpectedOperator> {
        return this._operators;
    }
}
