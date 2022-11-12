import { Generator, ValueReplacerHandler } from '@boart/core';

import { TemplateHandler } from './TemplateHandler';

/**
 *
 */
export class TemplateGenerator implements Generator {
    /**
     *
     */
    readonly name = 'tpl';

    /**
     *
     */
    generate(template: string): string {
        const templateValue = TemplateHandler.instance.get(template);

        if (!templateValue) {
            throw Error(`error template generator, template: '${template}' does not exist`);
        }

        return ValueReplacerHandler.instance.replace(templateValue);
    }
}