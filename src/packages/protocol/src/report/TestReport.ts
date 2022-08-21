import fs from 'fs';

import { EnvLoader, Runtime } from '@boart/core';

import { TestReportItem } from '../report-item/TestReportItem';
import { TicketItem } from '../report-item/TicketItem';

/**
 *
 */

export class TestReport {
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
    public static extractTickets(ticketDefinition: string): TicketItem[] {
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
    private getNumber(location: string, name: string): string {
        const nameMatch = name.match(/^([\d]+[\d.]*)/);
        const nameNumber = !nameMatch ? '' : nameMatch[1].replace(/[.]$/, '');

        const locationMatch = location.match(/^([\d])/);
        if (!!locationMatch) {
            const locationNumber = locationMatch[1].replace(/[.]$/, '');
            return nameNumber.replace(/^\d+/, locationNumber);
        }
        return nameNumber;
    }

    /**
     *
     */
    private getName(name: string): string {
        return name.replace(/\d[\d.]+\W*/, '');
    }

    /**
     *
     */
    public report(): void {
        // after reporting the test, reset singleton instance
        delete globalThis._testReportInstance;

        const currentTestRuntime = Runtime.instance.testRuntime.current;
        const id = currentTestRuntime.id;

        // data output
        const objectData: TestReportItem = {
            id,
            number: this.getNumber(currentTestRuntime.location, currentTestRuntime.name),
            name: this.getName(currentTestRuntime.name),
            tags: currentTestRuntime.tags,
            errorMessage: currentTestRuntime.errorMessage,
            stackTrace: currentTestRuntime.stackTrace,
            status: currentTestRuntime.status,
            priority: currentTestRuntime.priority,
            startTime: currentTestRuntime.startTime,
            duration: currentTestRuntime.duration,
            tickets: TestReport.extractTickets(this.ticket),
            descriptions: this.descriptions,
            failureDescription: this.failureDescription
        };
        const data: string = JSON.stringify(objectData);

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
    public setTicket(ticket: string) {
        this.ticket = ticket;
    }
}
