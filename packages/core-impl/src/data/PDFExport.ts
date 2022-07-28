import { getDocument } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

/**
 *
 */
export class PdfExport {
    /**
     *
     */
    static async GetTextFromPDF(buffer_or_path: string | ArrayBuffer): Promise<string> {
        const doc = await getDocument(buffer_or_path as unknown).promise;
        const page1 = await doc.getPage(1);
        const content = await page1.getTextContent();

        return content.items.map((item: TextItem) => item.str).join(' ');
    }
}

module.exports = new PdfExport();
