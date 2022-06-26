import { ContentType } from '@boart/core';
import json_logic_js from 'json-logic-js';

import { JsonLogicOperator } from './JsonLogicOperator';

/**
 *
 */
interface JsonLogicInput {
    readonly data: ContentType;
    readonly rule: string;
    readonly error: string;
}

/**
 *
 */
interface JsonLogicOutput {
    readonly data: ContentType;
    readonly rule: string;
    readonly error: string;
}

/**
 *
 */
export class JsonLogic {
    private static readonly _instance = new JsonLogic();

    /**
     *
     */
    static get instance(): JsonLogic {
        return JsonLogic._instance;
    }

    /**
     *
     */
    private constructor() {
        // singleto
    }

    /**
     *
     */
    addOperator(operator: JsonLogicOperator) {
        const names = typeof operator.name === 'string' ? [operator.name] : operator.name;

        if (!names) {
            throw Error(`name is required for JsonLogicOperator: '${operator.constructor.name}'`);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        names.forEach((name) => json_logic_js.add_operation(name, (...args: readonly unknown[]) => operator.execute(...args)));
    }

    /**
     *
     */
    private static tryParse(content: string, errormessage: string): object | string {
        try {
            // try parsing objects
            return JSON.parse(content);
        } catch {
            try {
                // try parsing simple string
                return JSON.parse(`"${content}"`);
            } catch {
                throw new Error(errormessage);
            }
        }
    }

    /**
     *
     */
    private convertInput(rule_or_logicInput: string, jsonData: string): JsonLogicInput {
        const rule = rule_or_logicInput;

        const rule_and_error = JsonLogic.tryParse(rule, `cannot parse rule: ${rule}`);
        return {
            data: JsonLogic.tryParse(jsonData, `cannot parse data: ${jsonData}`),
            rule: !!rule_and_error['rule'] ? (rule_and_error['rule'] as string) : (rule_and_error as string),
            error: rule_and_error['error'] as string
        };
    }

    /**
     *
     */
    private evaluate(rule: string, jsonData: string): JsonLogicOutput {
        const logicInput = this.convertInput(rule, jsonData);
        try {
            return {
                rule: logicInput.rule,
                error: logicInput.error,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                data: json_logic_js.apply(logicInput.rule, logicInput.data) as string
            };
        } catch (error) {
            throw Error(`cannot apply rule ${rule}\n${error.message as string}`);
        }
    }

    /**
     *
     */
    public transform(rule: string, jsonData: string): ContentType {
        const result = this.evaluate(rule, jsonData);
        return result.data;
    }

    /**
     *
     */
    public isTruthy(rule: string, jsonData: string): boolean {
        const result = this.evaluate(rule, jsonData);
        return result.data === true;
    }

    /**
     *
     */
    public isFalsy(rule: string, jsonData: string): boolean {
        const result = this.evaluate(rule, jsonData);
        return result.data === false;
    }

    /**
     *
     */
    public checkFalsy(rule: string, jsonData: string): void {
        const result = this.evaluate(rule, jsonData);
        if (result.data !== false) {
            throw new Error(result.error || 'jsonLogic expression must be falsy: ' + JSON.stringify(rule, null, '  '));
        }
    }

    /**
     *
     */
    public checkTruthy(rule: string, jsonData: string): void {
        const result = this.evaluate(rule, jsonData);
        if (result.data !== true) {
            throw new Error(result.error || 'jsonLogic expression must be true:' + JSON.stringify(rule, null, '  '));
        }
    }
}
