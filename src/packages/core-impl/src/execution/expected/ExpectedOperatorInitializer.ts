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
    public addOperator(operator: ExpectedOperator, ignoreEqual = false): void {
        const existingOperator = this._operators.toArray().find((o) => o.name === operator.name);

        if (!existingOperator) {
            this._operators.next(operator);
        }

        if (!!existingOperator && ignoreEqual === false) {
            throw new Error(`expected operator '${operator.name}' already exists`);
        }
    }

    /**
     *
     */
    get operators(): Observable<ExpectedOperator> {
        return this._operators;
    }
}
