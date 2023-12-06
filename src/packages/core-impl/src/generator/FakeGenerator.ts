import { Generator, TextLanguageHandler } from '@boart/core';
import { faker } from '@faker-js/faker';

/**
 *
 */
export class FakeGenerator implements Generator {
    /**
     *
     */
    readonly name = 'fake';

    /**
     *
     */
    constructor() {
        TextLanguageHandler.instance.language.subscribe((lang) => {
            faker.locale = lang;
        });
    }

    /**
     *
     */
    private tryParseInt(value: string): number | string {
        return !value.match(/^\d+$/) ? value : parseInt(value);
    }

    /**
     *
     */
    generate(paras: string[]): string {
        const level1 = paras?.shift();
        const level2 = paras?.shift();

        if (!level2) {
            throw Error(`error calling faker, at least one parameter must be defined`);
        }

        try {
            if (!level1 || !level2) {
                return faker.helpers.fake(`{{${level1 ?? ''}.${level2 ?? ''}}}`);
            } else {
                const paraObject = JSON.stringify(
                    paras
                        .map((p) => {
                            const [name, value] = p.split('=');
                            return { name, value };
                        })
                        .reduce((p, c) => {
                            p[c.name] = this.tryParseInt(c.value);
                            return p;
                        }, {})
                );
                return faker.helpers.fake(`{{${level1}.${level2}(${paraObject})}}`);
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw Error(`error calling faker namespace '${level1}.${level2}', see: https://fakerjs.dev/, \n\n${error}`);
        }
    }
}
