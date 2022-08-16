import fs from 'fs';

import { EnvLoader } from '@boart/core';
import { v1 as uuidv1 } from 'uuid';

/**
 *
 */

export class ScenarioReport {
    private readonly _id = uuidv1();
    private environment: string;
    private priority: string;
    private startTime: string;
    private output: string;
    private input: string;
    private ticket: string;
    private iteration: string;
    private readonly descriptions = new Array<string>();
    private readonly failureDescription = new Array<string>();
    private scenarioContext: object;

    private static _instance: ScenarioReport;

    /**
     *
     */
    private constructor(scenarioContext: object) {
        this.startTime = new Date().toISOString();
        this.scenarioContext = scenarioContext;
        this.environment = EnvLoader.instance.getEnvironment();
    }

    /**
     *
     */
    public static create(scenarioContext: object): ScenarioReport {
        return (ScenarioReport._instance = new ScenarioReport(scenarioContext));
    }

    /**
     *
     */
    public static get instance(): ScenarioReport {
        return ScenarioReport._instance;
    }

    /**
     *
     */
    public static extractTickets(ticketDefinition: string) {
        return (ticketDefinition?.split(/[ ,;]/) || [])
            .filter((t) => !!t)
            .map((t) => {
                let id = t;
                let link = EnvLoader.instance.get('ticket_source_default');
                let source = 'JITpay';

                const ticket = t.split(':');
                if (ticket.length > 1) {
                    id = ticket[1];
                    source = ticket[0];
                    const link2 = EnvLoader.instance.get(`ticket_source_${source}`);
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
        const data: string = JSON.stringify({
            id: this._id,
            priority: this.priority,
            startTime: this.startTime,
            output: this.output,
            input: this.input,
            iteration: this.iteration,
            environment: this.environment,
            tickets: ScenarioReport.extractTickets(this.ticket),
            descriptions: this.descriptions,
            failureDescription: this.failureDescription
        });

        const filename = EnvLoader.instance.mapReportData(`${this._id}.json`);
        console.message(`##report##${JSON.stringify({ id: this._id, filename })}`);
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.error(writeErr);
        });
    }

    /**
     *
     */
    public addDescription(value: string): void {
        this.descriptions.push(value);
    }

    /**
     *
     */
    public addFailureDescription(value: string): void {
        this.failureDescription.push(value);
    }

    /**
     *
     */
    public setPriority(priority: string) {
        this.priority = priority;
    }

    /**
     *
     */
    public setInput(input: string) {
        this.input = input;
    }

    /**
     *
     */
    public setOutput(output: string) {
        this.output = output;
    }

    /**
     *
     */
    public setTicket(ticket: string) {
        this.ticket = ticket;
    }

    /**
     *
     */
    public setIteration(iteration: string) {
        this.iteration = iteration;
    }
}
