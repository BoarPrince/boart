/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import ContentBase from './DataContentBase';

/**
 *
 */
export class EMailHtmlContent extends ContentBase implements DataContent {
    private readonly emailItem: any;

    /**
     *
     */
    readonly type = ContentInstance.EMail;

    /**
     *
     */
    constructor(emailItem) {
        super();
        this.emailItem = emailItem;
    }

    /**
     *
     */
    getText(): string {
        return this.emailItem.html;
    }

    /**
     *
     */
    getValue(): ContentType {
        return this.emailItem;
    }
}
