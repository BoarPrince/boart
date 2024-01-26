import { ExpectedDescription, FullDescription } from '@boart/core';
import { Environment } from 'nunjucks';

import { ChildMap } from '../util/ChildMap';

import { DescriptionCreator } from '../basic/DescriptionCreator';
import { DescriptionCreatorFactory } from '../basic/DescriptionCreatorFactory';
import { DescriptionLinkReference } from '../basic/DescriptionLinkReference';

/**
 *
 */
export class ExpectedConverter implements DescriptionCreator {
    private description: ExpectedDescription;

    /**
     *
     */
    constructor(
        private env: Environment,
        description: FullDescription
    ) {
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
    public addLinkReference(fileName: string, linkReferenceMap: Map<string, DescriptionLinkReference>): void {
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
    public populateChildMap(childMap: ChildMap): void {
        this.description.operators.forEach((desc) => {
            if (!desc.parentId) {
                return;
            }
            childMap.get(desc.parentId).push(desc);
        });
    }

    /**
     *
     */
    public create(templateName: string): string {
        return this.env.render(templateName, this.description);
    }
}
