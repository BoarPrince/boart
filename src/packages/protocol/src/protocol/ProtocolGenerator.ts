import fs from 'fs';
import path from 'path';

import { EnvLoader, RuntimeContext, RuntimePriority, RuntimeStatus } from '@boart/core';

import { DataItem } from '../protocol-item/DataItem';
import { LocalItem } from '../protocol-item/LocalItem';
import { OverviewItem } from '../protocol-item/OverviewItem';
import { ProtocolItem } from '../protocol-item/Protocoltem';
import { StatisticItem } from '../protocol-item/StatisticItem';
import { StatisticValueItem } from '../protocol-item/StatisticValueItem';
import { StepItem } from '../protocol-item/StepItem';
import { TestItem } from '../protocol-item/TestItem';
import { LocalReportItem } from '../report-item/LocalReportItem';
import { StepReportDataItem } from '../report-item/StepReportDataItem';
import { StepReportItem } from '../report-item/StepReportitem';
import { TestReportItem } from '../report-item/TestReportItem';

/**
 *
 */
export class ProtocolGenerator {
    private stepItems = new Map<string, StepReportItem>();
    private testItems = new Map<string, TestReportItem>();
    private localItems = new Map<string, LocalReportItem>();

    /**
     *
     */
    private static toDurationMin(duration: string): string {
        return (Number.parseFloat(duration) / 60).toFixed(2);
    }
    /**
     *
     */
    private readReport(): RuntimeContext {
        const filename = EnvLoader.instance.mapReportData(`boart-runtime-data.json`);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const fileContent: string = fs.readFileSync(filename, 'utf-8');
        return JSON.parse(fileContent);
    }

    /**
     *
     */
    private tryReadItems(runtimeDefinition: RuntimeContext): void {
        runtimeDefinition.localContext.forEach((locaItem) => {
            const filename = EnvLoader.instance.mapReportData(locaItem.id + '.json');

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            if (!fs.existsSync(filename)) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const content: string = fs.readFileSync(filename, 'utf-8');
            this.localItems.set(locaItem.id, JSON.parse(content) as LocalReportItem);
        });

        runtimeDefinition.localContext.forEach((localItem) =>
            localItem.testContext.forEach((testItem) => {
                const filename = EnvLoader.instance.mapReportData(testItem.id + '.json');

                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (!fs.existsSync(filename)) {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                const content: string = fs.readFileSync(filename, 'utf-8');
                const item = JSON.parse(content) as TestReportItem;
                item.localReportItemId = localItem.id;
                this.testItems.set(testItem.id, item);
            })
        );

        runtimeDefinition.localContext.forEach((localItem) =>
            localItem.testContext.forEach((testItem) =>
                testItem.stepContext.forEach((stepItem) => {
                    const filename = EnvLoader.instance.mapReportData(stepItem.id + '.json');

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    if (!fs.existsSync(filename)) {
                        return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const content: string = fs.readFileSync(filename, 'utf-8');
                    const item = JSON.parse(content) as StepReportItem;
                    item.localReportItemId = localItem.id;
                    item.testReportItemId = testItem.id;
                    this.stepItems.set(stepItem.id, item);
                })
            )
        );
    }

    /**
     *
     */
    private generateStatistic(): StatisticItem {
        const calculate = (priority: RuntimePriority): StatisticValueItem => {
            return Array.from(this.testItems.values())
                .filter((item) => item.priority === priority)
                .reduce(
                    (p, c) => {
                        p.failed += c.status === RuntimeStatus.failed ? 1 : 0;
                        p.passed += c.status === RuntimeStatus.succeeded ? 1 : 0;
                        return p;
                    },
                    {
                        passed: 0,
                        failed: 0
                    }
                );
        };

        return {
            high: calculate(RuntimePriority.high),
            medium: calculate(RuntimePriority.medium),
            low: calculate(RuntimePriority.low)
        };
    }

    /**
     *
     */
    private generateOverviewItems(): Array<OverviewItem> {
        return Array.from(this.stepItems.values()).map((stepItem) => {
            const testItem = this.testItems.get(stepItem.testReportItemId);
            const localItem = this.localItems.get(stepItem.localReportItemId);

            return {
                topic: `${localItem.number}. ${localItem.name}`,
                name: `${testItem.number}. ${testItem.name}`,
                ticket: testItem.tickets.find(() => true)?.id || '',
                tags: localItem.tags?.join(', '),
                status: RuntimeStatus[testItem.status],
                priority: RuntimePriority[testItem.priority],
                duration: testItem.duration,
                startTime: testItem.startTime,
                localId: localItem.id,
                testId: testItem.id
            };
        });
    }

    /**
     *
     */
    private generateLocals(): Record<string, LocalItem> {
        const locals: Record<string, LocalItem> = {};

        this.localItems.forEach((localItem) => {
            locals[localItem.id] = {
                id: localItem.id,
                tags: localItem.tags.join(', '),
                duration: localItem.duration,
                status: RuntimeStatus[localItem.status],
                name: localItem.name,
                number: localItem.number
            };
        });

        return locals;
    }

    /**
     *
     */
    generateDataItems(data: Record<string, StepReportDataItem>): Array<DataItem> {
        return Object.keys(data)
            .map((key) => data[key])
            .map((dataItem) => {
                return {
                    id: '-',
                    desc: dataItem.description,
                    data: dataItem.data
                };
            });
    }

    /**
     *
     */
    private generateSteps(testItemId: string): Array<StepItem> {
        const testItems = Array.from(this.stepItems.values()).filter((stepItem) => stepItem.testReportItemId === testItemId);

        return testItems.map((stepItem) => {
            return {
                id: stepItem.id,
                status: RuntimeStatus[stepItem.status],
                errorMessage: stepItem.errorMessage,
                duration: stepItem.duration,
                startTime: stepItem.startTime,
                type: stepItem.type,
                description: stepItem.description,
                input: this.generateDataItems(stepItem.input),
                output: this.generateDataItems(stepItem.result)
            };
        });
    }

    /**
     *
     */
    private generateTests(): Record<string, TestItem> {
        const tests: Record<string, TestItem> = {};

        this.testItems.forEach((testItem) => {
            tests[testItem.id] = {
                id: testItem.id,
                tags: testItem.tags.join(', '),
                name: `${testItem.number}. ${testItem.name}`,
                status: RuntimeStatus[testItem.status],
                duration: testItem.duration,
                startTime: testItem.startTime,
                priority: RuntimePriority[testItem.priority],
                descriptions: testItem.descriptions,
                tickets: testItem.tickets,
                steps: this.generateSteps(testItem.id)
            };
        });
        return tests;
    }

    /**
     *
     */
    private generateProtocol(runtimeDefinition: RuntimeContext): ProtocolItem {
        return {
            statistic: this.generateStatistic(),
            overview: this.generateOverviewItems(),
            locals: this.generateLocals(),
            tests: this.generateTests(),
            projectName: runtimeDefinition.name,
            environment: runtimeDefinition.environment,
            durationMin: ProtocolGenerator.toDurationMin(runtimeDefinition.duration),
            startTime: runtimeDefinition.startTime
        };
    }

    /**
     *
     */
    private generateData(): string {
        const runtimeDefinition = this.readReport();
        this.tryReadItems(runtimeDefinition);

        const protocol = this.generateProtocol(runtimeDefinition);
        const filename = EnvLoader.instance.mapReportData('test-protocol.json');
        const protocolData = JSON.stringify(protocol);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFileSync(filename, protocolData, 'utf-8');
        return protocolData;
    }

    /**
     *
     */
    private generateHtml(protocolData: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const template: string = fs.readFileSync(path.resolve(__dirname, 'protocol-template.html'), 'utf-8');

        const htmlContent = template.replace('${protocol_data}', protocolData);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        const filename = EnvLoader.instance.mapReportData(path.join('..', 'test-protocol.html'));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        fs.writeFileSync(filename, htmlContent, 'utf-8');
    }

    /**
     *
     */
    public generate(): void {
        const protocolData = this.generateData();
        this.generateHtml(protocolData);
    }
}
