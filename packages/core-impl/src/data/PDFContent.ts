import { ContentInstance, ContentType, DataContent, DataContentBase } from '@boart/core';

import { PdfExport } from './PDFExport';

/**
 *
 */
export class PDFContent extends DataContentBase implements DataContent {
    private pdf_text: string;
    public type = ContentInstance.PDF;

    /**
     *
     */
    constructor() {
        super();
        this.pdf_text = null;
    }

    /**
     *
     */
    async setBufferAsync(buffer: ArrayBuffer): Promise<PDFContent> {
        this.pdf_text = await PdfExport.GetTextFromPDF(buffer);
        return this;
    }

    /**
     *
     */
    getText(): string {
        return this.pdf_text;
    }

    /**
     *
     */
    getValue(): ContentType {
        return this.getText();
    }
}
