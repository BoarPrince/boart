import * as fs from 'fs';

import { EnvLoader } from '../common/EnvLoader';
import { ExpectedOperatorInitializer } from '../expected/ExpectedOperatorInitializer';
import { TableHandlerInstances } from '../table/TableHandlerInstances';

import { Description } from './Description';
import { ExpectedDescription } from './ExpectedDescription';
import { FullDescription } from './FullDescription';
import { TableHandlerDescription } from './TableHandlerDescription';
import { DescriptionFileReader } from './DescriptionFileReader';

/**
 *
 */
export class DescriptionHandler {
    /**
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    public static get instance(): DescriptionHandler {
        if (!globalThis._descriptionHandlerInstance) {
            globalThis._descriptionHandlerInstance = new DescriptionHandler();
        }
        return globalThis._descriptionHandlerInstance;
    }

    /**
     *
     */
    private describeTableHandler(): TableHandlerDescription[] {
        const tableHandlerList = Array.from(TableHandlerInstances.instance.values);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return tableHandlerList.map(([_, tableHandler]) => {
            const desc: TableHandlerDescription = {
                desc: DescriptionHandler.solve(tableHandler.getExecutionEngine()?.mainExecutionUnit().description),
                dataTables: tableHandler
                    .getRowDefinitions()
                    .filter((def) => !!def.description)
                    .map((def) => DescriptionHandler.solve(def.description))
            };

            return desc;
        });
    }

    /**
     *
     */
    private describeExpectedOperation(): ExpectedDescription {
        return {
            desc: DescriptionHandler.solve(ExpectedOperatorInitializer.instance.description),
            operators: ExpectedOperatorInitializer.instance.operators
                .filter((op) => !!op.description)
                .map((op) => ({ op, desc: DescriptionHandler.solve(op.description) }))
                .filter((desc) => !!desc.desc)
                .map((desc) => {
                    desc.desc.title = desc.desc.title || desc.op.name;
                    return desc.desc;
                })
        };
    }

    /**
     *
     */
    public save(): void {
        const descriptions: FullDescription = {
            tableHandlers: this.describeTableHandler(),
            expected: this.describeExpectedOperation(),
            replacer: null
        };

        const fileName = EnvLoader.instance.mapDescriptionData('description.json');
        fs.writeFileSync(fileName, JSON.stringify(descriptions));
    }

    /**
     * Adjust indentation for every line. Template for each line is the previous line.
     * Or the last previous line before an empty line.
     *
     * @param value multiline text with different indentations
     */
    private static adjustIndent(value: string): string {
        const lines = value.split('\n');
        let currentIndent: string = null;
        lines.forEach((line, index) => {
            if (/^\s*$/.test(line)) {
                lines[index] = '';
                return;
            }

            if (currentIndent == null) {
                currentIndent = /^\s*/.exec(line)[0];
                return;
            }

            lines[index] = line.replace(/^\s+/, currentIndent);
        });

        return lines.join('\n');
    }

    /**
     *
     * */
    public static solve(description: Description | (() => Description)): Description {
        if (!description) {
            return null;
        }

        return typeof description === 'function'
            ? description()
            : {
                  id: description.id || '',
                  title: description.title || '',
                  parentId: description.parentId,
                  description: this.adjustIndent(description.description || ''),
                  examples:
                      description.examples?.map((example) => {
                          example.example = this.adjustIndent(example.example);
                          return example;
                      }) ?? null
              };
    }

    /**
     *
     */
    public static readDescription(fileName: string, pathName?: string): Description {
        return new DescriptionFileReader().readDescription(fileName, pathName);
    }
}
