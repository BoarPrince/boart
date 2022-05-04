const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

export class PdfExport {
    /**
     *
     */
    static async GetTextFromPDF(buffer_or_path): Promise<string> {
        const doc = await pdfjsLib.getDocument(buffer_or_path).promise;
        const page1 = await doc.getPage(1);
        const content = await page1.getTextContent();

        return content.items.map(item => item.str);
    }
}

module.exports = new PdfExport();
