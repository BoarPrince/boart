import { RowDataBinder } from './RowDataBinder';
import { MetaInfo } from './TableMetaInfo';
import { TableRows } from './TableRows';

/**
 *
 */
describe('check Row Data Binder', () => {
    const metaInfo: MetaInfo = {
        tableName: 'test-table',
        key: 'action',
        values: ['value1', 'value2']
    };

    /**
     *
     */
    it('check null parameter (all)', () => {
        const sut = new RowDataBinder(null, null, null);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'null': parameter for table handler seems not to be a table`);
            return;
        }
        throw Error('error must be thrown table instance is not correct or null');
    });

    /**
     *
     */
    it('check null parameter (metaInfo)', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };

        const sut = new RowDataBinder(metaInfo.tableName, null, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': missing table definition, column: 'no-meta-info'`);
            return;
        }
        throw Error('error must be thrown table instance is not correct or null');
    });

    /**
     *
     */
    it('check wrong table format (headers)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableInstance: any = {
            header: {
                cells: ['action', 'value1', 'value2']
            },
            rows: []
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance as TableRows);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': parameter for table handler seems not to be a table`);
            return;
        }
        throw Error('error must be thrown table instance is not correct or null');
    });

    /**
     *
     */
    it('check missing table definition', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['ac', 'value1', 'value2']
            },
            rows: []
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': at least one row must be defined`);
            return;
        }
        throw Error('error must be thrown table instance is not correct or null');
    });

    /**
     *
     */
    it('check missing row (empty)', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2']
            },
            rows: []
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': at least one row must be defined`);
            return;
        }
        throw Error('error must be thrown table instance is not correct or null');
    });

    /**
     *
     */
    it('check column not defined', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2', 'value3']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`column 'value3' is not defined!`);
            return;
        }
        throw Error('error must be thrown if table instance is not correct or null');
    });

    /**
     *
     */
    it('check missing column', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value3']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': missing table definition, column: 'value2'`);
            return;
        }
        throw Error('error must be thrown if table instance is not correct or null');
    });

    /**
     *
     */
    it('check to less columns', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': table parameter must have at least a key and one value`);
            return;
        }
        throw Error('error must be thrown if table contains to less columns');
    });

    /**
     *
     */
    it('check to less columns (null)', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: null
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        try {
            sut.check();
        } catch (error) {
            expect(error.message).toBe(`'test-table': table parameter must have at least a key and one value`);
            return;
        }
        throw Error('error must be thrown if table contains to less columns');
    });

    /**
     *
     */
    it('check column comment', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2']
            },
            rows: [
                {
                    cells: ['-a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        const rows = sut.bind();
        expect(rows).toBeDefined();
        expect(rows.length).toBe(0);
    });

    /**
     *
     */
    it('check column without comment', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        const rows = sut.bind();
        expect(rows).toBeDefined();
        expect(rows.length).toBe(1);
    });

    /**
     *
     */
    it('check binded values (1)', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        const rows = sut.bind();
        expect(rows).toEqual([{ key: 'a', values: { value1: 'b', value2: 'c' }, values_replaced: { value1: 'b', value2: 'c' } }]);
    });

    /**
     *
     */
    it('check binded values (2)', () => {
        const tableInstance: TableRows = {
            headers: {
                cells: ['action', 'value1', 'value2']
            },
            rows: [
                {
                    cells: ['a', 'b', 'c']
                },
                {
                    cells: ['d', 'e', 'f']
                }
            ]
        };
        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        const rows = sut.bind();
        expect(rows).toEqual([
            { key: 'a', values: { value1: 'b', value2: 'c' }, values_replaced: { value1: 'b', value2: 'c' } },
            { key: 'd', values: { value1: 'e', value2: 'f' }, values_replaced: { value1: 'e', value2: 'f' } }
        ]);
    });

    /**
     *
     */
    it('check binded values (Markdown Table)', () => {
        const tableInstance = `
            |action|value1|value2|
            |------|------|------|
            |a     |b     |c     |`;

        const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
        const rows = sut.bind();
        expect(rows).toEqual([{ key: 'a', values: { value1: 'b', value2: 'c' }, values_replaced: { value1: 'b', value2: 'c' } }]);
    });

    /**
     *
     */
    it.each([
        [['a', '1', '3'], ['', '2', '4'], '1\n2', '3\n4'], //
        [['a', '1', '3'], [null, '2', '4'], '1\n2', '3\n4'],
        [['a', '1', '2'], ['', '', ''], '1', '2'],
        [['a', '1', '2'], ['', '', '3'], '1', '2\n3'],
        [['a', '1', '3'], ['-', '2', '4'], '1', '3']
    ])(
        `check multiline (firstRow: '%s', secondRow: '%s', firstValue: '%s', secondValue: '%s'`,
        (firstCellRow: string[], secondCellRow: string[], firstCellValue: string, secondCellValue: string) => {
            // multine is the last row
            const tableInstance: TableRows = {
                headers: {
                    cells: ['action', 'value1', 'value2']
                },
                rows: [
                    {
                        cells: firstCellRow
                    },
                    {
                        cells: secondCellRow
                    }
                ]
            };
            const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
            const rows = sut.bind();
            expect(rows).toEqual([
                {
                    key: firstCellRow[0],
                    values: { value1: firstCellValue, value2: secondCellValue },
                    values_replaced: { value1: firstCellValue, value2: secondCellValue }
                }
            ]);
        }
    );

    /**
     *
     */
    it.each([
        [['a', '1', '3'], ['', '2', '4'], '1\n2', '3\n4'], //
        [['a', '1', '3'], [null, '2', '4'], '1\n2', '3\n4'],
        [['a', '1', '2'], ['', '', ''], '1', '2'],
        [['a', '1', '2'], ['', '', '3'], '1', '2\n3'],
        [['a', '1', '3'], ['-', '2', '4'], '1', '3']
    ])(
        `check multiline (followed by other row) (firstRow: '%s', secondRow: '%s', firstValue: '%s', secondValue: '%s'`,
        (firstCellRow: string[], secondCellRow: string[], firstCellValue: string, secondCellValue: string) => {
            // multine is followed by other rows
            const tableInstance: TableRows = {
                headers: {
                    cells: ['action', 'value1', 'value2']
                },
                rows: [
                    {
                        cells: firstCellRow
                    },
                    {
                        cells: secondCellRow
                    },
                    {
                        cells: ['b', '1', '2']
                    }
                ]
            };
            const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
            const rows = sut.bind();
            expect(rows).toEqual([
                {
                    key: firstCellRow[0],
                    values: { value1: firstCellValue, value2: secondCellValue },
                    values_replaced: { value1: firstCellValue, value2: secondCellValue }
                },
                {
                    key: 'b',
                    values: { value1: '1', value2: '2' },
                    values_replaced: { value1: '1', value2: '2' }
                }
            ]);
        }
    );

    /**
     *
     */
    it.each([
        [['a', '1', '3'], ['', '2', '4'], '1\n2', '3\n4'], //
        [['a', '1', '3'], [null, '2', '4'], '1\n2', '3\n4'],
        [['a', '1', '2'], ['', '', ''], '1', '2'],
        [['a', '1', '2'], ['', '', '3'], '1', '2\n3'],
        [['a', '1', '3'], ['-', '2', '4'], '1', '3']
    ])(
        `check multiline (following other row) (firstRow: '%s', secondRow: '%s', firstValue: '%s', secondValue: '%s'`,
        (firstCellRow: string[], secondCellRow: string[], firstCellValue: string, secondCellValue: string) => {
            // multine is followed by other rows
            const tableInstance: TableRows = {
                headers: {
                    cells: ['action', 'value1', 'value2']
                },
                rows: [
                    {
                        cells: ['b', '1', '2']
                    },
                    {
                        cells: firstCellRow
                    },
                    {
                        cells: secondCellRow
                    }
                ]
            };
            const sut = new RowDataBinder(metaInfo.tableName, metaInfo, tableInstance);
            const rows = sut.bind();
            expect(rows).toEqual([
                {
                    key: 'b',
                    values: { value1: '1', value2: '2' },
                    values_replaced: { value1: '1', value2: '2' }
                },
                {
                    key: firstCellRow[0],
                    values: { value1: firstCellValue, value2: secondCellValue },
                    values_replaced: { value1: firstCellValue, value2: secondCellValue }
                }
            ]);
        }
    );
});
