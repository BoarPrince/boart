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
    getText(): string {
        return this.text;
    }

    /**
     *
     */
    setText(text: string) {
        this.text = text;
    }

    /**
     *
     */
    getValue(): ContentType {
        return this.text;
    }
}
