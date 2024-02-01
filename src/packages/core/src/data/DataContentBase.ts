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
    protected tryParse(content: string, failedContent: ContentType): object | ContentType {
        try {
            return JSON.parse(content) as object;
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
    valueOf(): object | string | number | boolean {
        return this.getValue()?.valueOf();
    }

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
      try {
        return JSON.stringify(JSON.parse(this.getText()));
      } catch (error) {
          return this.getText();
      }
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
        return this.getValue() == null;
    }
}
