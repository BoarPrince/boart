import { Observable } from 'rxjs';

import { ArraySubject } from '../common/ArraySubject';
import { NativeType } from '../data/NativeType';
import { Description } from '../description/Description';
import { Descriptionable } from '../description/Descriptionable';

import { ExpectedOperator, ExpectedOperatorResult } from './ExpectedOperator';

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
        description: 'this is the description of Expected Operator Initializer',
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

        // define title if description is not defined, but the title is missing
        if (!!operator.description && !operator.description.title) {
            operator.description.title = `expected:${operator.name}`;
        }

        // 1. add ci and not operators
        this.addNotAndCiOperator(operator);

        // 2. add default implementation
        if (!!operator.default) {
            const description = !operator.description
                ? null
                : {
                      id: `${operator.description.id}:default`,
                      parentId: operator.description.id,
                      title: 'expected',
                      description: `The '<ref:${operator.description.id}>' operator it's the default
                            operator and it's used when no operator is defined`,
                      examples: null
                  };

            const defaultOperator: ExpectedOperator = {
                name: '',
                description,
                caseInsesitive: operator.caseInsesitive,
                check: (value, expectedValue) => operator.check(value, expectedValue)
            };
            this._operators.next(defaultOperator);
            this.addNotAndCiOperator(defaultOperator);
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

    /**
     *
     */
    private addNotAndCiOperator(operator: ExpectedOperator) {
        // add not: operator
        this._operators.next(this.generateNotOperator(operator));

        // add :ci operator
        if (operator.caseInsesitive) {
            const ciOperator = this.generateCIOperator(operator);

            this._operators.next(ciOperator);
            this._operators.next(this.generateNotOperator(ciOperator));
        }
    }

    /**
     *
     */
    private generateNotOperator(operator: ExpectedOperator): ExpectedOperator {
        const description = !operator.description
            ? null
            : {
                  id: `${operator.description.id}:not`,
                  parentId: operator.description.id,
                  title: `${operator.description.title}:not`,
                  description: `It's the not extension of the '<ref:${operator.description.id}>' operator`,
                  examples: null
              };

        return {
            name: operator.name + (!!operator.name ? ':' : '') + 'not',
            description,
            caseInsesitive: operator.caseInsesitive,
            check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                const result = await operator.check(value, expectedValue);
                return {
                    result: !result.result
                };
            }
        };
    }

    /**
     *
     */
    private generateCIOperator(operator: ExpectedOperator): ExpectedOperator {
        const lowercase = (value: NativeType): string => value?.toString()?.toLowerCase() || '';
        const description = !operator.description
            ? null
            : {
                  id: `${operator.description.id}:ci`,
                  parentId: operator.description.id,
                  title: `${operator.description.title}:ci`,
                  description: `It's the ci (case insensitive) extension of the '<ref:${operator.description.id}>' operator`,
                  examples: null
              };

        return {
            name: operator.name + (!!operator.name ? ':' : '') + 'ci',
            caseInsesitive: true,
            description,
            check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                const result = await operator.check(lowercase(value), lowercase(expectedValue));
                return {
                    result: result.result
                };
            }
        };
    }
}
