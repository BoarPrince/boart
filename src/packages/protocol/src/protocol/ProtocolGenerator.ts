import { randomUUID } from 'crypto';
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
    private static jsonParse<T>(jsonContent: string): T {
        try {
            return JSON.parse(jsonContent);
        } catch (error) {
            console.error('failed to read', jsonContent);
            throw error;
        }
    }

    /**
     *
     */
    private get stepItemsWithDescription(): Array<StepReportItem> {
        return Array.from(this.stepItems.values()).filter((stepItem) => stepItem.description?.length > 0);
    }

    /**
     *
     */
    private static toDurationMin(duration: number): string {
        return (duration / 60).toFixed(2);
    }

    /**
     *
     */
    private readReport(): RuntimeContext {
        const filename = EnvLoader.instance.mapReportData(`boart-runtime-data.json`);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const fileContent: string = fs.readFileSync(filename, 'utf-8');
        return ProtocolGenerator.jsonParse(fileContent);
    }

    /**
     *
     */
    private readContextItems(runtimeDefinition: RuntimeContext): void {
        runtimeDefinition.localContext.forEach((locaItem) => {
            const filename = EnvLoader.instance.mapReportData(locaItem.id + '.json');

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            if (!fs.existsSync(filename)) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const content: string = fs.readFileSync(filename, 'utf-8');
            this.localItems.set(locaItem.id, ProtocolGenerator.jsonParse(content));
        });

        // concat and remove duplicates
        const concatTags = (testTags: string[], localTags: string[]) => {
            return testTags
                ?.concat(localTags)
                .sort()
                .reduce((p, c) => {
                    if (!p.includes(c)) {
                        p.push(c);
                    }
                    return p;
                }, new Array<string>());
        };

        // read test items
        runtimeDefinition.localContext.forEach((localItem) =>
            localItem.testContext.forEach((testItem) => {
                const filename = EnvLoader.instance.mapReportData(testItem.id + '.json');

                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (!fs.existsSync(filename)) {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                const content: string = fs.readFileSync(filename, 'utf-8');
                const item = ProtocolGenerator.jsonParse<TestReportItem>(content);
                item.tags = concatTags(item.tags, localItem.tags);
                item.localReportItemId = localItem.id;
                this.testItems.set(testItem.id, item);
            })
        );

        // read step items
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
                    const item = ProtocolGenerator.jsonParse<StepReportItem>(content);
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
                        p.succeed += c.status === RuntimeStatus.succeed ? 1 : 0;
                        return p;
                    },
                    {
                        succeed: 0,
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
        return Array.from(this.testItems.values())
            .filter((testItem) => !!this.stepItemsWithDescription.find((stepItem) => stepItem.testReportItemId === testItem.id))
            .map((testItem) => {
                const localItem = this.localItems.get(testItem.localReportItemId);

                return {
                    topic: `${localItem.number}. ${localItem.name}`,
                    name: `${testItem.number}. ${testItem.name}`,
                    ticket: testItem.tickets.find(() => true)?.id || '',
                    tags: testItem.tags,
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
                tags: localItem.tags,
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
    private groupingStepItems(stepItems: Array<StepItem>, testNumber: string): Array<StepItem> {
        const groupedStepItems = new Array<StepItem>();
        let currentGroupStepItem: StepItem = null;
        stepItems.forEach((stepItem) => {
            if (!stepItem.group) {
                groupedStepItems.push(stepItem);
                currentGroupStepItem = null;
                return;
            }
            if (!currentGroupStepItem || currentGroupStepItem.group !== stepItem.group) {
                currentGroupStepItem = {
                    id: randomUUID(),
                    type: 'group',
                    status: null,
                    duration: 0,
                    description: stepItem.group,
                    group: stepItem.group,
                    startTime: null,
                    steps: [stepItem],
                    errorMessage: null,
                    detailDescription: null,
                    input: null,
                    output: null
                };
                groupedStepItems.push(currentGroupStepItem);
            } else {
                currentGroupStepItem.steps.push(stepItem);
            }
        });

        // calculate status
        groupedStepItems
            .filter((stepItem) => !!stepItem.steps)
            .forEach((groupItem) => {
                groupItem.status = !groupItem.steps.find((stepItem) => stepItem.status === RuntimeStatus[RuntimeStatus.failed])
                    ? RuntimeStatus[RuntimeStatus.succeed]
                    : RuntimeStatus[RuntimeStatus.failed];
            });

        // calculate duration
        groupedStepItems
            .filter((stepItem) => !!stepItem.steps)
            .forEach((groupItem) => {
                groupItem.duration = groupItem.steps.reduce((p, c) => (p += c.duration), 0);
            });

        // number items
        groupedStepItems.forEach((stepItem, index) => {
            stepItem.description = `${testNumber}.${index + 1}. ${stepItem.description}`;
            stepItem.steps?.forEach((childStepItem, childIndex) => {
                childStepItem.description = `${testNumber}.${index + 1}.${childIndex + 1} ${childStepItem.description}`;
            });
        });

        return groupedStepItems;
    }

    /**
     *
     */
    private generateSteps(testItemId: string): Array<StepItem> {
        const stepItems = this.stepItemsWithDescription.filter((stepItem) => stepItem.testReportItemId === testItemId);

        return stepItems.map((stepItem) => {
            const stepDescription = stepItem.description.split('\n');

            return {
                id: stepItem.id,
                status: RuntimeStatus[stepItem.status],
                errorMessage: stepItem.errorMessage,
                duration: stepItem.duration,
                startTime: stepItem.startTime,
                type: stepItem.type,
                group: stepItem.group,
                description: stepDescription.shift(),
                detailDescription: stepDescription,
                steps: null,
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
                tags: testItem.tags,
                name: `${testItem.number}. ${testItem.name}`,
                status: RuntimeStatus[testItem.status],
                duration: testItem.duration,
                startTime: testItem.startTime,
                priority: RuntimePriority[testItem.priority],
                descriptions: testItem.descriptions,
                tickets: testItem.tickets,
                steps: this.groupingStepItems(this.generateSteps(testItem.id), testItem.number)
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
        this.readContextItems(runtimeDefinition);

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

        console.log('Protocol generated to =>', 'file://' + path.resolve(filename));
    }

    /**
     *
     */
    public generate(): void {
        const protocolData = this.generateData();
        this.generateHtml(protocolData);
    }
}
