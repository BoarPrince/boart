import { ExpectedDescription, FullDescription } from '@boart/core';
import { Environment } from 'nunjucks';

import { DescriptionCreator } from './DescriptionCreator';
import { DescriptionCreatorFactory } from './DescriptionCreatorFactory';
import { DescriptionLinkReference } from './DescriptionLinkReference';

/**
 *
 */
export class ExpectedConverter implements DescriptionCreator {
    private description: ExpectedDescription;

    /**
     *
     */
    constructor(private env: Environment, description: FullDescription) {
        this.description = description.expected;
    }

    /**
     *
     */
    public static get factory(): DescriptionCreatorFactory {
        return {
            create: (env: Environment, description: FullDescription): DescriptionCreator => new ExpectedConverter(env, description),
            resourceName: 'expected'
        };
    }

    /**
     *
     */
    addLinkReference(fileName: string, linkReferenceMap: Map<string, DescriptionLinkReference>): void {
        const desc = this.description.desc;
        linkReferenceMap.set(desc.id, {
            desc: desc,
            marker: `${fileName}#${desc.id}`
        });

        this.description.operators.forEach((operator) => {
            linkReferenceMap.set(operator.id, {
                desc: operator,
                marker: `${fileName}#${operator.id}`
            });
        });
    }

    /**
     *
     */
    create(templateName: string): string {
        return this.env.render(templateName, this.description);
    }

    // /**
    //  *
    //  */
    // public convert(): { fileName: string; content: string } {
    //     const desc = DescriptionHandler.convertMarkdownToHTML(this.description.desc.description);

    //     const operatorsDesc = this.description.operators
    //         .map((operator) => {
    //             operator.title = (!!operator.title ? '' : ':') + operator.title;
    //             return operator;
    //         })
    //         .sort((op1, op2) => op1.title.localeCompare(op2.title))
    //         .map((operator) => {
    //             const opDesc = DescriptionHandler.convertMarkdownToHTML(operator.description);
    //             const op = `<dt id="${operator.id}">
    //                           <h3>${operator.title}</h3>
    //                         </dt>
    //                         <dd>${opDesc}</dd>`;

    //             const examples = (operator.examples || []).map((example) => {
    //                 const exampleDesc = DescriptionHandler.convertMarkdownToHTML(example.example);
    //                 return `<dd>
    //                           <h4>${example.title}</h4>
    //                           <div class="example">${exampleDesc}</div>
    //                         </dd>`;
    //             });

    //             return `${op}${examples.join('\n')}`;
    //         });

    //     const content = `<h1>Expected</h1>${desc}
    //                   <dl>${operatorsDesc.join('\n')}</dl>`;

    //     return {
    //         content,
    //         fileName: null //EnvLoader.instance.mapDescriptionData(ExpectedConverter.FILENAME)
    //     };
    // }
}
