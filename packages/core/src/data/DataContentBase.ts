import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import { DataContentObject } from './DataContentObject';

/**
 *
 */
export default abstract class DataContentBase implements DataContent {
    abstract get type(): ContentInstance;

    /**
     *
     */
    tryParse(content: string, failedContent): object {
        try {
            return JSON.parse(content);
        } catch (error) {
            return failedContent;
        }
    }

    /**
     *
     */
     
    abstract getValue(): ContentType;

    /**
     *
     */
    abstract getText(): string;

    /**
     *
     */
    toString(): string {
        return this.getText();
    }

    /**
     *
     */
    toJSON(): string {
        return JSON.stringify(this.tryParse(this.getText(), this.getText()));
    }

    /**
     *
     */
    isObject() {
        return false;
    }

    /**
     *
     */
    asDataContentObject(): DataContentObject {
        return null;
    }

    /**
     *
     */
    isNullOrUndefined() {
        return !this.getValue();
    }
}
