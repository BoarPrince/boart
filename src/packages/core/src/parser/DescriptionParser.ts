import { DescriptionCodeExamplePosition, DescriptionCodeExampleType } from '../description/DescriptionCodeExample';
import { ASTDescription, ASTUnitDescription } from './ast/ASTDescription';
import { DescriptionCodeExample } from './ast/DescriptionCodeExample';
import { DescriptionExample } from './ast/DescriptionExample';

/**
 *
 */
export enum DescriptionToken {
    DescriptionHeader,
    ExampleHeader,
    CodeHeader,
    Comment,
    Default
}

/**
 *
 */
export interface DescriptionTokenResult {
    type: DescriptionToken;
    meta: Map<string, string>;
    text: string;
    textShort?: string;
}

/**
 *
 */
export interface DescriptionTokenizer {
    parse(line: string): DescriptionTokenResult;
    readonly priority: number;
}

/**
 *
 */
class DescriptionHeaderTokenizer implements DescriptionTokenizer {
    public priority: 100;

    /**
     *
     */
    public parse(line: string): DescriptionTokenResult {
        const match = line.match(/^\s*##\s*([^#()]+)(\s*\(\s*([^)(]+)\s*\))?\s*$/);
        return match
            ? {
                  type: DescriptionToken.DescriptionHeader,
                  meta: null,
                  text: match[1].trim(),
                  textShort: match[3]?.trim()
              }
            : null;
    }
}

/**
 *
 */
class CommentTokenizer implements DescriptionTokenizer {
    public priority: 100;

    /**
     *
     */
    public parse(line: string): DescriptionTokenResult {
        const match = line.match(/^-+$/);
        return match
            ? {
                  type: DescriptionToken.Comment,
                  meta: null,
                  text: null
              }
            : null;
    }
}

/**
 *
 */
class ExampleHeaderTokenizer implements DescriptionTokenizer {
    public priority: 100;

    /**
     *
     */
    public parse(line: string): DescriptionTokenResult {
        const match = line.match(/^\s*###\s*[Ee][Xx][Aa][Mm][Pp][Ll][Ee]:\s*(.+)$/);
        return match
            ? {
                  type: DescriptionToken.ExampleHeader,
                  meta: null,
                  text: match[1].trim()
              }
            : null;
    }
}

/**
 *
 */
class CodeHeaderTokenizer implements DescriptionTokenizer {
    public priority: 100;
    private keyValues = new Set<string>();

    /**
     *
     */
    constructor(keyValues: Array<[string, Array<string>]>) {
        keyValues.forEach((keyValue) => keyValue[1].forEach((value) => this.keyValues.add(`${keyValue[0]}:${value}`)));
    }

    /**
     *
     */
    private extractMetaDefinition(metaDef: string): Map<string, string> {
        const meta = new Map<string, string>();
        const options = metaDef?.split(',').map((option) => option.split(':'));
        for (const option of options || []) {
            meta.set(option[0].trim(), option[1].trim());
        }
        return meta;
    }

    /**
     *
     */
    private checkMetaDefinition(meta: Map<string, string>) {
        meta.forEach((value, key) => {
            if (!this.keyValues.has(`${key}:${value}`)) {
                throw new Error(`code definition not known '${key}:${value}'`);
            }
        });
    }

    /**
     *
     */
    public parse(line: string): DescriptionTokenResult {
        const match = line.match(/^\s*####\s*[Cc][Oo][Dd][Ee]:\s*([^()]+)\s*(\((.+)\))?$/);
        if (match) {
            const meta = this.extractMetaDefinition(match[3]);
            this.checkMetaDefinition(meta);
            return {
                type: DescriptionToken.CodeHeader,
                meta,
                text: match[1].trim()
            };
        } else {
            return null;
        }
    }
}

/**
 *
 */
export class DescriptionParser {
    private tokenizers = Array<DescriptionTokenizer>();

    /**
     *
     */
    constructor() {
        this.addTokenizer(new DescriptionHeaderTokenizer());
        this.addTokenizer(new ExampleHeaderTokenizer());
        this.addTokenizer(
            new CodeHeaderTokenizer([
                ['position', ['before', 'after']],
                ['type', ['json', 'text']]
            ])
        );
        this.addTokenizer(new CommentTokenizer());
    }

    /**
     *
     */
    public addTokenizer(tokenizer: DescriptionTokenizer): void {
        this.tokenizers.push(tokenizer);
    }

    /**
     *
     */
    private getToken(line: string): DescriptionTokenResult {
        for (const tokenizer of this.tokenizers) {
            const token = tokenizer.parse(line);
            if (token) {
                return token;
            }
        }
        return null;
    }

    /**
     *
     */
    public parse(value: string): ASTDescription | ReadonlyArray<ASTUnitDescription> {
        if (!value) {
            throw new Error('description cannot be empty');
        }

        const desc = new Array<ASTUnitDescription>();
        let currentDesc: ASTUnitDescription;
        let currentLines = new Array<string>();
        let currentExample: DescriptionExample;

        for (const line of value.split('\n')) {
            const token = this.getToken(line);
            switch (token?.type) {
                /**
                 *
                 */
                case DescriptionToken.DescriptionHeader: {
                    currentLines = new Array<string>();
                    currentDesc = {
                        unit: token.text,
                        desc: {
                            id: token.text,
                            title: token.text,
                            titleShort: token.textShort ?? token.text,
                            desc: currentLines,
                            examples: new Array<DescriptionExample>(),
                            location: undefined
                        }
                    };
                    desc.push(currentDesc);
                    break;
                }

                /**
                 *
                 */
                case DescriptionToken.ExampleHeader: {
                    currentLines = new Array<string>();
                    currentExample = {
                        title: token.text,
                        codes: new Array<DescriptionCodeExample>(),
                        text: currentLines,
                        location: undefined
                    };
                    currentDesc?.desc.examples.push(currentExample);
                    break;
                }

                /**
                 *
                 */
                case DescriptionToken.CodeHeader: {
                    currentLines = new Array<string>();
                    currentExample?.codes.push({
                        title: token.text,
                        type: <DescriptionCodeExampleType>token.meta?.get('type') ?? 'json',
                        position: <DescriptionCodeExamplePosition>token.meta?.get('position') ?? 'after',
                        code: currentLines,
                        location: undefined
                    });
                    break;
                }

                /**
                 *
                 */
                case DescriptionToken.Comment:
                    break;

                /**
                 *
                 */
                default:
                    currentLines.push(line);
            }
        }

        if (desc.length === 0) {
            throw new Error('at least one description must be defined');
        }
        return desc.length === 1 ? desc[0].desc : desc;
    }
}
