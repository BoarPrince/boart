import { Generator } from './Generator';
import { faker } from '@faker-js/faker';
import { TextLanguageHandler } from '../common/TextLanguageHandler';

/**
 *
 */
export class FakeGenerator implements Generator {
    /**
     *
     */
    readonly name = 'FakeGenerator';

    /**
     *
     */
    constructor() {
        TextLanguageHandler.instance.language.subscribe(lang => {
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
    generate(level1: string, level2: string, ...params: readonly string[]): string {
        try {
            if (!params || params.length === 0) {
                return faker.fake(`{{${level1}.${level2}}}`);
            } else {
                const paraObject = JSON.stringify(
                    params
                        .map(p => {
                            const [name, value] = p.split('=');
                            return { name, value };
                        })
                        .reduce((p, c) => {
                            p[c.name] = this.tryParseInt(c.value);
                            return p;
                        }, {})
                );
                return faker.fake(`{{${level1}.${level2}(${paraObject})}}`);
            }
        } catch (error) {
            throw Error(`error calling faker namespace '${level1}.${level2}', ${error}`);
        }
    }
}
