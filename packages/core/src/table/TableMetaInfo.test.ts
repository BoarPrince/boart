import { AnyBaseRowType } from './BaseRowType';
import { TableMetaInfo } from './TableMetaInfo';
import { key, value } from './TableRowDecorator';

/**
 *
 */
class TableTypeTest extends AnyBaseRowType {
    @key()
    get action() {
        return this.data.key;
    }

    @value()
    get value1() {
        return this.data.values_replaced['value1'];
    }

    @value()
    get value2() {
        return this.data.values_replaced['value2'];
    }
}

/**
 *
 */
class TableTypeNoKeyTest extends AnyBaseRowType {
    @value()
    get value1() {
        return this.data.values_replaced['value1'];
    }
}

/**
 *
 */
class TableTypeNoValueTest extends AnyBaseRowType {
    @key()
    get action() {
        return this.data.key;
    }
}

describe('check TableMetaInfo', () => {
    it('check key info', () => {
        const sut = TableMetaInfo.get(TableTypeTest);
        expect(sut.key).toBe('action');
    });

    it('check value info', () => {
        const sut = TableMetaInfo.get(TableTypeTest);
        expect(sut.values).toBeDefined();
        expect(sut.values.length).toBe(2);
        expect(sut.values).toEqual(['value1', 'value2']);
    });

    it('check meta info by instance', () => {
        const instance = new TableTypeTest(null);
        const sut = TableMetaInfo.getByInstance(instance);
        expect(sut.key).toBeDefined();
        expect(sut.values).toBeDefined();
    });

    it('check no key defined', () => {
        try {
            TableMetaInfo.get(TableTypeNoKeyTest);
        } catch (error) {
            expect(error.message).toBe(`key is not defined for table definition 'TableTypeNoKeyTest'`);
            return;
        }
        throw Error('error must be thrown if no key is defined');
    });

    it('check no value defined', () => {
        try {
            TableMetaInfo.get(TableTypeNoValueTest);
        } catch (error) {
            expect(error.message).toBe(`no value defined for table definition 'TableTypeNoValueTest'`);
            return;
        }
        throw Error('error must be thrown if no value is defined');
    });
});
