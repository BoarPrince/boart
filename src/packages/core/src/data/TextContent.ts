import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import DataContentBase from './DataContentBase';

/**
 *
 */
export class TextContent extends DataContentBase {
    private text: string;

    /**
     *
     */
    readonly type = ContentInstance.Text;

    /**
     *
     */
    constructor(text: string) {
        super();
        this.text = text;
    }

    /**
     *
     */
    private static isObject(content: string): boolean {
        try {
            const parsedValue = JSON.parse(content) as object;
            return typeof parsedValue === 'object';
        } catch (error) {
            return false;
        }
    }

    /**
     *
     */
    getText(): string {
        return this.text;
    }

    /**
     *
     */
    toJSON(): string {
        if (TextContent.isObject(this.text)) {
            // normally not usual, but the text content can be a valid json (object)
            return this.text;
        } else {
            return JSON.stringify(this.text);
        }
    }

    /**
     *
     */
    getValue(): ContentType {
        return this.text;
    }
}
