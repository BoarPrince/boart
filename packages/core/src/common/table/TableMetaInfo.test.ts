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
        const metaInfo = TableMetaInfo.get(TableTypeTest);
        expect(metaInfo.key).toBe('action');
    });

    it('check value info', () => {
        const metaInfo = TableMetaInfo.get(TableTypeTest);
        expect(metaInfo.values).toBeDefined();
        expect(metaInfo.values.length).toBe(2);
        expect(metaInfo.values).toEqual(['value1', 'value2']);
    });

    it('check meta info by instance', () => {
        const instance = new TableTypeTest(null);
        const metaInfo = TableMetaInfo.getByInstance(instance);
        expect(metaInfo.key).toBeDefined();
        expect(metaInfo.values).toBeDefined();
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
