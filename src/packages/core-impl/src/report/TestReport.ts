import fs from 'fs';

import { EnvLoader, Runtime } from '@boart/core';

/**
 *
 */

export class TestReport {
    private priority: string;
    private ticket: string;
    private descriptions: string;
    private failureDescription: string;

    /**
     *
     */
    private constructor() {
        // singleton cannot be instantiated from outside
    }

    /**
     *
     */
    public static get instance(): TestReport {
        if (!globalThis._testReportInstance) {
            globalThis._testReportInstance = new TestReport();
        }
        return globalThis._testReportInstance;
    }

    /**
     *
     */
    public static extractTickets(ticketDefinition: string) {
        return (ticketDefinition?.split(/[ ,;]/) || [])
            .filter((t) => !!t)
            .map((t) => {
                let id = t;
                let link = EnvLoader.instance.get('ticket_link_default');
                let source = EnvLoader.instance.get('ticket_source_default');

                const ticket = t.split(':');
                if (ticket.length > 1) {
                    id = ticket[1];
                    source = ticket[0];
                    const link2 = EnvLoader.instance.get(`ticket_link_${source}`);
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
        // after reporting the test, reset singleton instance
        delete globalThis._stepReportInstance;

        const id = Runtime.instance.testRuntime.current.id;
        // data output
        const data: string = JSON.stringify({
            id,
            errorMessage: Runtime.instance.testRuntime.current.errorMessage,
            stackTrace: Runtime.instance.testRuntime.current.stackTrace,
            status: Runtime.instance.testRuntime.current.status,
            priority: this.priority,
            startTime: Runtime.instance.testRuntime.current.startTime,
            duration: Runtime.instance.testRuntime.current.duration,
            tickets: TestReport.extractTickets(this.ticket),
            descriptions: this.descriptions,
            failureDescription: this.failureDescription
        });

        const filename = EnvLoader.instance.mapReportData(`${id}.json`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFile(filename, data, 'utf-8', (writeErr) => {
            if (writeErr) return console.error(writeErr);
        });
    }

    /**
     *
     */
    public setDescription(value: string): void {
        this.descriptions = value;
    }

    /**
     *
     */
    public setFailureDescription(value: string): void {
        this.failureDescription = value;
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
    public setTicket(ticket: string) {
        this.ticket = ticket;
    }
}
