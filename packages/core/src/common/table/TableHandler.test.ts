import { AnyBaseRowType } from './BaseRowType';
import { RowDefinition } from './RowDefinition';
import { TableHandler } from './TableHandler';
import { TableRowType } from './TableRowType';
import { key, value } from './TableRowDecorator';
import { TableMetaInfo } from './TableMetaInfo';

/**
 *
 */
TableMetaInfo.get = () => {
    return {
        tableName: 'my-table',
        key: 'my-action',
        values: ['my-value']
    };
};

/**
 *
 */
class RowWithOneValue extends AnyBaseRowType {
    @key()
    get action() {
        return this.data.key;
    }

    get actionPara() {
        return this.data.keyPara;
    }

    @value()
    get value() {
        return this.data.values_replaced['my-value'];
    }
}

/**
 *
 */
describe('check TableHandler', () => {
    /**
     *
     */
    it('add row definitions (value)', () => {
        const sut = new TableHandler(null, null);

        sut.addRowDefinition(
            new RowDefinition({
                key: Symbol('my-value'),
                type: TableRowType.PostProcessing,
                executionUnit: null,
                validators: null
            })
        );
    });

    /**
     *
     */
    it('process rows', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executionEngineMock: any = {
            execute: jest.fn()
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const sut = new TableHandler(RowWithOneValue, executionEngineMock);

        sut.addRowDefinition(
            new RowDefinition({
                key: Symbol('a'),
                type: TableRowType.PostProcessing,
                executionUnit: null,
                validators: null
            })
        );

        await sut.process({
            headers: {
                cells: ['my-action', 'my-value']
            },
            rows: [
                {
                    cells: ['a', 'b']
                }
            ]
        });

        const callPara = executionEngineMock.execute.mock.calls[0][0] as Array<RowWithOneValue>;
        expect(callPara).toBeInstanceOf(Array);
        expect(callPara).toHaveLength(1);

        expect(callPara[0].action).toBe('a');
        expect(callPara[0].value).toBe('b');
    });
});
