import { Observable } from 'rxjs';

import { ArraySubject } from '../common/ArraySubject';
import { NativeType } from '../data/NativeType';
import { Descriptionable } from '../description/Descriptionable';

import { ExpectedOperator, ExpectedOperatorResult } from './ExpectedOperator';
import { DescriptionHandler } from '../description/DescriptionHandler';

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
    public description = () => ({
        id: '07c83a77-e3b1-400f-9966-2b7460f4c86a',
        title: 'expected:operation:initializer',
        description: 'this is the description of Expected Operator Initializer',
        examples: null
    });

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

        // 1. add ci and not operators
        this.addNotAndCiOperator(operator);

        // 2. add default implementation
        if (operator.default) {
            const defaultOperator: ExpectedOperator = {
                name: '',
                description: () => {
                    const operatorDescription = DescriptionHandler.solve(operator.description);

                    // define title if description is not defined, but the title is missing
                    if (!!operatorDescription && !operatorDescription.title) {
                        operatorDescription.title = `expected:${operator.name}`;
                        operatorDescription.titleShort = `expected:${operator.name}`;
                    }

                    return !operatorDescription
                        ? null
                        : {
                              id: `${operatorDescription.id}:default`,
                              parentId: operatorDescription.id,
                              title: 'expected',
                              titleShort: 'expected',
                              description: `The '<ref:${operatorDescription.id}>' operator it's the default
                                operator and it's used when no operator is defined`,
                              examples: null
                          };
                },
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
        return {
            name: operator.name + (operator.name ? ':' : '') + 'not',
            description: () => {
                const operatorNotDescription = DescriptionHandler.solve(operator.description);
                return !operatorNotDescription
                    ? null
                    : {
                          id: `${operatorNotDescription.id}:not`,
                          parentId: operatorNotDescription.id,
                          title: `${operatorNotDescription.title || ''}:not`,
                          titleShort: `${operatorNotDescription.titleShort !== 'ci' ? '' : 'ci:'}not`,
                          description: `It's the not extension of the '<ref:${operatorNotDescription.id}>' operator`,
                          examples: null
                      };
            },
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
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const lowercase = (value: NativeType): string => value?.toString()?.toLowerCase() || '';

        return {
            name: operator.name + (operator.name ? ':' : '') + 'ci',
            caseInsesitive: true,
            description: () => {
                const operatorCIDescription = DescriptionHandler.solve(operator.description);
                return !operatorCIDescription
                    ? null
                    : {
                          id: `${operatorCIDescription.id}:ci`,
                          parentId: operatorCIDescription.id,
                          title: `${operatorCIDescription.title || ''}:ci`,
                          titleShort: 'ci',
                          description: `It's the ci (case insensitive) extension of the '<ref:${operatorCIDescription.id}>' operator`,
                          examples: null
                      };
            },
            check: async (value, expectedValue): Promise<ExpectedOperatorResult> => {
                const result = await operator.check(lowercase(value), lowercase(expectedValue));
                return {
                    result: result.result
                };
            }
        };
    }
}
