import { Description } from './Description';
import { Descriptionable } from './Descriptionable';
import { DescriptionFileNotFounError } from './DescriptionFileNotFounError';
import { DescriptionHandler } from './DescriptionHandler';

/**
 *
 */
export class DescriptionCollector {
    private _descriptions: Array<Description>;

    /**
     *
     */
    private constructor(
        public readonly name: string,
        public readonly type: string
    ) {
        this._descriptions = new Array<Description>();
    }

    /**
     *
     */
    public get descriptions(): ReadonlyArray<Description> {
        return this._descriptions.filter((desc) => !!desc);
    }

    /**
     *
     */
    public static collect(name: string, type: string, descriptionAbles: Array<Descriptionable>): DescriptionCollector {
        const instance = new DescriptionCollector(name, type);

        for (const descAble of descriptionAbles) {
            if (descAble.description) {
                const description = descAble.description();
                instance._descriptions.push(description);
            } else {
                // if not description is defined explicity, try getting a description file with the same name
                const description = DescriptionCollector.getDescription(descAble);
                instance._descriptions.push(description);
            }
        }

        return instance;
    }

    /**
     *
     */
    private static getFilePath(descAble: Descriptionable): string | null {
        const modules = Object.values(require.cache);

        const nodeModule = modules
            .filter((mn) => mn?.exports)
            .find((mn) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const mod = mn.exports[descAble.constructor.name];
                return !!mod && mod === descAble.constructor;
            });

        return nodeModule ? nodeModule.filename : null;
    }

    /**
     *
     */
    public static getDescription(descAble: Descriptionable): Description | null {
        const fileName = DescriptionCollector.getFilePath(descAble);
        if (fileName) {
            try {
                return DescriptionHandler.readDescription(fileName);
            } catch (error) {
                if (error instanceof DescriptionFileNotFounError) {
                    return null;
                } else {
                    throw error;
                }
            }
        } else {
            return null;
        }
    }
}
