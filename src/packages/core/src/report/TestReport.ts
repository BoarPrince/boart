import fs from 'fs';

import { TestReportItem } from './report-item/TestReportItem';
import { TicketItem } from './report-item/TicketItem';

import { LocalReport } from './LocalReport';
import { EnvLoader } from '../common/EnvLoader';
import { Runtime } from '../runtime/Runtime';
import { RuntimeStatus } from '../runtime/RuntimeStatus';
import { RuntimePriority } from '../runtime/RuntimePriority';

/**
 *
 */

export class TestReport {
    private ticket: string;
    private descriptions: string;
    private failureDescription: string;
    private static readonly numberNameRexp = /^(\d+\.)(\S*)\s+(.+)/;

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
    private static extractTickets(ticketDefinition: string): TicketItem[] {
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
                    if (link2) {
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
        const localNumber = LocalReport.getNumber(location, name);
        return (name?.replace(TestReport.numberNameRexp, localNumber + '.$2') || '').replace(/\.$/, '');
    }

    /**
     *
     */
    private getName(name: string): string {
        return name?.replace(TestReport.numberNameRexp, '$3') || '';
    }

    /**
     *
     */
    public report(): void {
        // after reporting the test, reset singleton instance
        globalThis._testReportInstance = null;

        const currentTestRuntime = Runtime.instance.testRuntime.currentContext;
        const id = currentTestRuntime.id;

        // data output
        const objectData: TestReportItem = {
            id,
            number: this.getNumber(currentTestRuntime.location, currentTestRuntime.name),
            name: this.getName(currentTestRuntime.name),
            tags: currentTestRuntime.tags,
            errorMessage: currentTestRuntime.errorMessage,
            stackTrace: currentTestRuntime.stackTrace,
            status: currentTestRuntime.status == null ? RuntimeStatus.notExecuted : currentTestRuntime.status,
            priority: currentTestRuntime.priority || RuntimePriority.medium,
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
