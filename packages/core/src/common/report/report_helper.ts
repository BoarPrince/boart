'use strict';

import fs from 'fs';

import { v1 as uuidv1 } from 'uuid';

const EnvLoader = require('./env_loader');

/**
 *
 */
export class IUIReportData {
    readonly action: string;
    readonly value: string;
    readonly tagName?: string;
    readonly location?: string;
    readonly error?: ReadonlyArray<string>;
    readonly restCalls?: ReadonlyArray<string>;
    readonly proxyName?: string;
    readonly context: any;
    readonly xpath?: string;
    readonly startTime: number;
    readonly endTime: number;

    /**
     *
     */
    constructor() {
        this.action = '';
        this.startTime = Date.now();
        this.restCalls = [];
        this.error = [];
        this.context = {};
    }
}

/**
 *
 */
export class TestReportHelper {
    private _projectName: string;
    private _environment: string;

    /**
     *
     */
    private constructor() {
        this._environment = EnvLoader.getEnvironment();
        this._projectName = EnvLoader.getProjectName();
    }

    /**
     *
     */
    public static get instance(): TestReportHelper {
        if (!gauge.context?.test_report_helper) {
            gauge.context = {
                step_report_helper: null,
                test_report_helper: null,
                scenario_report_helper: null
            };
            gauge.context.test_report_helper = new TestReportHelper();
        }
        return gauge.context.test_report_helper;
    }

    /**
     *
     */
    public report(): void {
        gauge.message(
            `##report##${JSON.stringify({
                projectName: this._projectName,
                environment: this._environment
            })}`
        );
    }

    /**
     *
     */
    public setEnvironment(value: string) {
        this._environment = value;
    }

    /**
     *
     */
    public setProjectName(value: string) {
        this._projectName = value;
    }
}

/**
 *
 */
export class ScenarioReportHelper {
    private readonly _id = uuidv1();
    private _environment: string;
    private _priority: string;
    private _startTime: string;
    private _output: string;
    private _input: string;
    private _ticket: string;
    private _iteration: string;
    private readonly _descriptions = new Array<string>();
    private readonly _failureDescription = new Array<string>();
    private scenarioContext: any;

    /**
     *
     */
    private constructor(scenarioContext: any) {
        this._startTime = new Date().toISOString();
        this.scenarioContext = scenarioContext;
        this._environment = EnvLoader.getEnvironment();
    }

    /**
     *
     */
    public static create(scenarioContext: any): ScenarioReportHelper {
        return (gauge.context.scenario_report_helper = new ScenarioReportHelper(scenarioContext));
    }

    /**
     *
     */
    public static get instance(): ScenarioReportHelper {
        return gauge.context.scenario_report_helper;
    }

    /**
     *
     */
    public static extractTickets(ticketDefinition: string) {
        return (ticketDefinition?.split(/[ ,;]/) || [])
            .filter(t => !!t)
            .map(t => {
                let id = t;
                let link = EnvLoader.get('ticket_source_default');
                let source = 'JITpay';

                const ticket = t.split(':');
                if (ticket.length > 1) {
                    id = ticket[1];
                    source = ticket[0];
                    const link2 = EnvLoader.get(`ticket_source_${source}`);
                    if (!!link2) {
                        link = link2;
                        source = source[0].toUpperCase() + source.slice(1);
                    }
                }
                return {
                    id: id,
                    link: `${link.replace('{id}', id)}`,
                    source
                };
            });
    }

    /**
     *
     */
    public report(): void {
        // data output
        const data = JSON.stringify({
            id: this._id,
            priority: this._priority,
            startTime: this._startTime,
            output: this._output,
            input: this._input,
            iteration: this._iteration,
            environment: this._environment,
            tickets: ScenarioReportHelper.extractTickets(this._ticket),
            descriptions: this._descriptions,
            failureDescription: this._failureDescription
        });

        const filename = EnvLoader.mapReportData(`${this._id}.json`);
        gauge.message(`##report##${JSON.stringify({ id: this._id, filename })}`);
        fs.writeFile(filename, data, 'utf-8', writeErr => {
            if (writeErr) return console.log(writeErr);
        });
    }

    /**
     *
     */
    public addDescription(value: string): void {
        this._descriptions.push(value);
    }

    /**
     *
     */
    public addFailureDescription(value: string): void {
        this._failureDescription.push(value);
    }

    /**
     *
     */
    public setPriority(priority: string) {
        this._priority = priority;
    }

    /**
     *
     */
    public setInput(input: string) {
        this._input = input;
    }

    /**
     *
     */
    public setOutput(output: string) {
        this._output = output;
    }

    /**
     *
     */
    public setTicket(ticket: string) {
        this._ticket = ticket;
    }

    /**
     *
     */
    public setIteration(iteration: string) {
        this._iteration = iteration;
    }
}

/**
 *
 */
export class StepReportHelper {
    private _id = uuidv1();
    private _type: string;
    private _startTime: string;
    private _descriptions = new Array<string>();
    private _result = new Map<string, string | ReadonlyArray<any>>();
    private _input = new Map<string, string | ReadonlyArray<any>>();
    private stepContext: any;

    /**
     *
     */
    private constructor(stepContext: any) {
        this._startTime = new Date().toISOString();
        this.stepContext = stepContext;
    }

    /**
     *
     */
    public static create(stepContext: any): StepReportHelper {
        return (gauge.context.step_report_helper = new StepReportHelper(stepContext));
    }

    /**
     *
     */
    public static get instance(): StepReportHelper {
        return gauge.context.step_report_helper;
    }

    /**
     *
     */
    public report(): void {
        if (this._descriptions.length == 0) {
            // do nothing, if no description is defined
            return;
        }

        const fromEntries = (map: ReadonlyMap<string, string | ReadonlyArray<any>>): any => {
            const o = {};
            for (const entry of map.entries()) {
                o[entry[0]] = entry[1];
            }
            return o;
        };

        // data output
        const data = JSON.stringify({
            id: this._id,
            type: this._type,
            startTime: this._startTime,
            description: this._descriptions,
            input: fromEntries(this._input),
            result: fromEntries(this._result)
        });

        const filename = EnvLoader.mapReportData(`${this._id}.json`);
        gauge.message(`##report##${JSON.stringify({ id: this._id, filename })}`);
        fs.writeFile(EnvLoader.mapReportData(`${this._id}.json`), data, 'utf-8', writeErr => {
            if (writeErr) return console.log(writeErr);
        });
    }

    /**
     *
     */
    public addInput(key: string, value: string | ReadonlyArray<any>): void {
        if (!value) {
            return;
        }

        if (Array.isArray(value) && value.length === 0) {
            return;
        }

        if (this._input.has(key)) {
            this._input.delete(key);
        }

        this._input.set(key, value);
    }

    /**
     *
     */
    public addInputDetail(key: string, value: any): void {
        if (!this._input.has(key)) {
            this._input.set(key, []);
        }
        const dataContainer = this._input.get(key);
        if (!Array.isArray(dataContainer)) {
            console.error(`Devcontainer of ${key}, must be a array`);
        } else {
            dataContainer.push(value);
        }
    }

    /**
     *
     */
    public getLastInputDetail(key: string): any {
        if (!this._input.has(key)) {
            return {};
        }
        const dataContainer = this._input.get(key);
        return dataContainer[dataContainer.length - 1];
    }

    /**
     *
     */
    public addInputData(value: string | ReadonlyArray<string>): void {
        this.addInput('data', value);
    }

    /**
     *
     */
    public addInputDataDetail(value: string | ReadonlyArray<string>): void {
        this.addInputDetail('data', value);
    }

    /**
     *
     */
    public setInputDesc(description: string): void {
        this.addInput('desc', description);
    }

    /**
     *
     */
    public setResultDesc(description: string): void {
        this.addResult('desc', description);
    }

    /**
     *
     */
    public addResult(key: string, value: string): void {
        if (!value) {
            return;
        }

        if (this._result.has(key)) {
            this._result.delete(key);
        }

        this._result.set(key, value);
    }

    /**
     *
     */
    public addResultDetail(key: string, value: any): void {
        if (!this._result.has(key)) {
            this._result.set(key, []);
        }
        const dataContainer = this._result.get(key);
        if (!Array.isArray(dataContainer)) {
            console.error(`Devcontainer of ${key}, must be a array`);
        } else {
            dataContainer.push(value);
        }
    }

    /**
     *
     */
    public addResultData(value: string): void {
        this.addResult('data', value);
    }

    /**
     *
     */
    public addResultDataDetail(value: string): void {
        this.addResultDetail('data', value);
    }

    /**
     *
     */
    public addDescription(value: string): void {
        this._descriptions.push(value);
    }

    /**
     *
     */
    public setType(type: string) {
        this._type = type;
    }
}

module.exports = { TestReportHelper, StepReportHelper, ScenarioReportHelper, IUIReportData };
