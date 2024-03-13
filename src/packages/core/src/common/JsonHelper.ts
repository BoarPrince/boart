import beautify from 'json-beautify';

/**
 *
 */
enum ContentType {
    STRING = 'string',
    JSON = 'json',
    OBJECT_WITH_CIRCULAR_DEPENDENCY = 'object_with_circular_dependency',
    JSON_AS_STRING = 'json_as_string',
    UNKNOWN = 'unknown'
}

/**
 *
 */
export class JsonHelper {
    private readonly content: unknown;
    private readonly type: string;

    private constructor(content: unknown) {
        this.content = content;
        this.type = this.getType();
    }

    /**
     *
     */
    public static create(content): JsonHelper {
        return new JsonHelper(content);
    }

    /**
     *
     */
    private static stringify(value: string): string {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (_, value: WeakKey) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            };
        };

        return JSON.stringify(value, getCircularReplacer());
    }

    /**
     *
     */
    private static stringifyFilter(value: string): string {
        const getFilterAgentReplacer = () => {
            return (key: string, value: string) => {
                if (key === 'agent') {
                    return;
                }
                if (key === 'body') {
                    return;
                }
                return value;
            };
        };

        return JSON.stringify(value, getFilterAgentReplacer());
    }

    /**
     *
     */
    private getType(): ContentType {
        if (typeof this.content === 'string' || (typeof this.content === 'object' && !!this.content.hasOwnProperty('getText'))) {
            try {
                JSON.parse(this.content as string);
                return ContentType.JSON_AS_STRING;
            } catch (e) {
                return ContentType.STRING;
            }
        } else if (typeof this.content === 'object') {
            try {
                JSON.stringify(this.content);
                return ContentType.JSON;
            } catch (e) {
                try {
                    JsonHelper.stringify(this.content as unknown as string);
                    return ContentType.OBJECT_WITH_CIRCULAR_DEPENDENCY;
                } catch (e2) {
                    return ContentType.UNKNOWN;
                }
            }
        }
    }

    /**
     *
     */
    private beautifyFor(spaceChar: string): string {
        switch (this.type as ContentType) {
            case ContentType.JSON: {
                return beautify(this.content, null, spaceChar, 100);
            }
            case ContentType.JSON_AS_STRING: {
                const content = JSON.parse(this.content as string) as object;
                return beautify(content, null, spaceChar, 100);
            }
            case ContentType.STRING: {
                return this.content as string;
            }
            case ContentType.OBJECT_WITH_CIRCULAR_DEPENDENCY: {
                const content = JsonHelper.stringifyFilter(this.content as string);
                return beautify(JSON.parse(content), null, spaceChar, 100);
            }
            default:
                return this.content as string;
        }
    }

    /**
     *
     */
    public beautifyForHTMLOutput(): string {
        return this.beautifyFor('&nbsp;&nbsp;');
    }

    /**
     *
     */
    public beautifyForConsoleOutput(): string {
        return this.beautifyFor('  ');
    }

    /**
     *
     */
    public simple(): string {
        return this.beautifyFor('  ');
    }
}
