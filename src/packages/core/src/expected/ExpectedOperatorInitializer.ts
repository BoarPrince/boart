import { Observable } from 'rxjs';

import { ArraySubject } from '../common/ArraySubject';
import { Description } from '../description/Description';
import { Descriptionable } from '../description/Descriptionable';

import { ExpectedOperator } from './ExpectedOperator';

/**
 *
 */
export class ExpectedOperatorInitializer implements Descriptionable {
    private readonly _operators = new ArraySubject<ExpectedOperator>();

    /**
     *
     */
    static get instance(): ExpectedOperatorInitializer {
        if (!globalThis._expectedOperatorInitializer) {
            globalThis._expectedOperatorInitializer = new ExpectedOperatorInitializer();
        }

        return globalThis._expectedOperatorInitializer;
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
    public description: Description = {
        id: '07c83a77-e3b1-400f-9966-2b7460f4c86a',
        title: 'expected:operation:initializer',
        description: 'xxx',
        examples: null
    };

    /**
     *
     */
    public clear(): void {
        this._operators.clear();
    }

    /**
     *
     */
    public exists(name: string): boolean {
        return !!this._operators.toArray().find((o) => o.name === name);
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
    get operators$(): Observable<ExpectedOperator> {
        return this._operators;
    }

    /**
     *
     */
    get operators(): ReadonlyArray<ExpectedOperator> {
        return this._operators.toArray();
    }
}
