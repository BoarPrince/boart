
import { ContentInstance } from './ContentInstance';
import { ContentType } from './ContentType';
import { DataContent } from './DataContent';
import ContentBase from './DataContentBase';
import { PdfExport } from './pdfExport';

/**
 *
 */
export class PDFContent extends ContentBase implements DataContent {
    getValue(): ContentType {
        throw new Error('Method not implemented.');
    }
    toJSON(): string {
        throw new Error('Method not implemented.');
    }
    private pdf_text: string;
    public type: ContentInstance = ContentInstance.PDF;

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
    async setBufferAsync(buffer) {
        this.pdf_text = await PdfExport.GetTextFromPDF(buffer);
    }

    /**
     *
     */
    getText(): string {
        return this.pdf_text;
    }
}
