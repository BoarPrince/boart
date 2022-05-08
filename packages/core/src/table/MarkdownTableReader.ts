import { TableRows } from './TableRows';

/**
 *
 */
export class MarkdownTableReader {
    /**
     *
     */
    static convert(markdownTable: string): TableRows {
        let responseHeaders: readonly string[] = [];
        const responseRows = new Array<{ cells: string[] }>();

        const reExpRowDelimiter = /^\s*[| -]+\s*$/;
        const reExpEmptyRow = /^\s*$/;
        const reExpRowContent = /^\s*[|](.+)[|]\s*$/;
        const reExpPipeMarker = /\\[|]/g;

        const rows = markdownTable.split('\n');
        let matchCount = 0;

        for (const row of rows) {
            if (reExpEmptyRow.test(row)) {
                continue;
            }

            if (reExpRowDelimiter.test(row)) {
                continue;
            }

            if (!reExpRowContent.test(row)) {
                throw Error(`row: ==>> ${row.trim()} <<== is not a markdown row`);
            }

            matchCount++;
            const lineContent = reExpRowContent.exec(row)[1];
            const lineColumns = lineContent
                .replace(reExpPipeMarker, '\x01')
                .split('|')
                // eslint-disable-next-line no-control-regex
                .map(p => p.replace(/\x01/g, '|').trim());

            // check content rows
            if (matchCount > 1) {
                responseRows.push({ cells: lineColumns });
                continue;
            }

            // check header row
            if (matchCount === 1) {
                responseHeaders = lineColumns;
            }
        }

        return {
            headers: {
                cells: responseHeaders
            },
            rows: responseRows
        };
    }
}
