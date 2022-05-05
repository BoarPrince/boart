import { JsonLogic } from './JsonLogic';
import { JsonLogicOperator } from './JsonLogicOperator';
import { JsonLogicOperatorInitializer } from './JsonLogicOperatorInitializer';

/**
 *
 */
describe('check jsonLogic', () => {
    const sut = JsonLogic.instance;

    /**
     *
     */
    describe('check problems', () => {
        /**
         *
         */
        it('wrong rules', () => {
            try {
                sut.transform('{a: "b"}', JSON.stringify({ a: 'b' }));
            } catch (error) {
                expect(error.message).toBe('cannot parse rule: {a: "b"}');
                return;
            }

            throw Error('error must occur when rule is not correct');
        });

        /**
         *
         */
        it('wrong data', () => {
            try {
                sut.transform('{"a": "b"}', '{ a: "b" }');
            } catch (error) {
                expect(error.message).toBe('cannot parse data: { a: "b" }');
                return;
            }

            throw Error('error must occur when rule is not correct');
        });

        /**
         *
         */
        it('wrong json logic rule', () => {
            try {
                sut.transform('{"a": "b"}', '{ "a": "b" }');
            } catch (error) {
                expect(error.message).toStartWith('cannot apply rule {"a": "b"}');
                return;
            }

            throw Error('error must occur when rule is not correct');
        });
    });

    /**
     *
     */
    describe('isFalsy', () => {
        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'b' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'd' } })],
            [
                '3. with error definition',
                '{"rule": {"===" : [ { "var" : "a.b" }, "c" ]}, "error": "this is an error"}',
                JSON.stringify({ a: { b: 'd' } })
            ]
        ])(`%s - isFalsy (true), %s -> data: %s `, (_: string, rule: string, data: string) => {
            const result = sut.isFalsy(rule, data);
            expect(result).toBe(true);
        });

        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'c' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'c' } })]
        ])(`%s - isFalsy (false), %s -> data: %s `, (_: string, rule: string, data: string) => {
            const result = sut.isFalsy(rule, data);
            expect(result).toBe(false);
        });
    });

    /**
     *
     */
    describe('isTruthy', () => {
        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'c' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'c' } })]
        ])(`%s - isTruthy (true), %s -> data: %s `, (_: string, rule: string, data: string) => {
            const result = sut.isTruthy(rule, data);
            expect(result).toBe(true);
        });

        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'd' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'd' } })]
        ])(`%s - isTruthy (false), %s -> data: %s `, (_: string, rule: string, data: string) => {
            const result = sut.isTruthy(rule, data);
            expect(result).toBe(false);
        });
    });

    /**
     *
     */
    describe('checkFalsy', () => {
        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'b' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'd' } })],
            [
                '3. with error definition',
                '{"rule": {"===" : [ { "var" : "a.b" }, "c" ]}, "error": "this is an error"}',
                JSON.stringify({ a: { b: 'd' } })
            ]
        ])(`%s - checkFalsy (ok), %s -> data: %s `, (_: string, rule: string, data: string) => {
            sut.checkFalsy(rule, data);
        });

        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'c' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'c' } })]
        ])(`%s - checkFalsy (not ok), %s -> data: %s `, (_: string, rule: string, data: string) => {
            try {
                sut.checkFalsy(rule, data);
            } catch (error) {
                expect(error.message).toStartWith('jsonLogic expression must be falsy:');
                return;
            }

            throw Error('error must occur when result is not falsy');
        });
    });

    /**
     *
     */
    describe('checkTruthy', () => {
        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'b' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'd' } })]
        ])(`%s - checkTruthy (not ok), %s -> data: %s `, (_: string, rule: string, data: string) => {
            try {
                sut.checkTruthy(rule, data);
            } catch (error) {
                expect(error.message).toStartWith('jsonLogic expression must be true:');
                return;
            }

            throw Error('error must occur when result is not falsy');
        });

        /***
         *
         */
        it.each([
            ['1. simple equal', '{"===" : [ { "var" : "a" }, "c" ]}', JSON.stringify({ a: 'c' })],
            ['2. complexer equal', '{"===" : [ { "var" : "a.b" }, "c" ]}', JSON.stringify({ a: { b: 'c' } })]
        ])(`%s - checkTruthy (ok), %s -> data: %s `, (_: string, rule: string, data: string) => {
            sut.checkTruthy(rule, data);
        });

        /**
         *
         */
        it('check explizit error message', () => {
            try {
                const rule = '{"rule": {"===" : [ { "var" : "a.b" }, "c" ]}, "error": "this is an error"}';
                const data = JSON.stringify({ a: { b: 'd' } });
                sut.checkTruthy(rule, data);
            } catch (error) {
                expect(error.message).toBe('this is an error');
                return;
            }

            throw Error('error must occur when result is not falsy');
        });
    });

    /**
     *
     */
    describe('transform', () => {
        /***
         *
         */
        it.each([
            ['1. simple (string)', '{ "var" : "a" }', JSON.stringify({ a: 'b' }), 'b'],
            ['2. complexer (string)', '{ "var" : "a.b" }', JSON.stringify({ a: { b: 'd' } }), 'd'],
            ['3. number', '{ "var" : "a.b" }', JSON.stringify({ a: { b: 1 } }), 1],
            ['4. number (0)', '{ "var" : "a.b" }', JSON.stringify({ a: { b: 0 } }), 0],
            ['5. boolean (true)', '{ "var" : "a.b" }', JSON.stringify({ a: { b: true } }), true],
            ['6. boolean (false)', '{ "var" : "a.b" }', JSON.stringify({ a: { b: false } }), false],
            ['7. null', '{ "var" : "a.b" }', JSON.stringify({ a: { b: null } }), null]
        ])(`%s - transform, %s -> data: %s `, (_: string, rule: string, data: string, expected: string) => {
            const result = sut.transform(rule, data);
            expect(result).toBe(expected);
        });

        /**
         *
         */
        it('check not transformable rule', () => {
            const rule = '{ "va" : "a.b" }';
            const data = JSON.stringify({ a: { b: null } });

            try {
                sut.transform(rule, data);
            } catch (error) {
                expect(error.message).toStartWith('cannot apply rule { "va" : "a.b" }');
                return;
            }

            throw Error('error must occur, when rule or data does not fit');
        });
    });

    /**
     *
     */
    describe('add logic operator', () => {
        /**
         *
         */
        class OperatorMock implements JsonLogicOperator {
            name: string | string[];
            execute = jest.fn();
        }

        /**
         *
         */
        @JsonLogicOperatorInitializer
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class OperatorMockWithInitializerDecorator implements JsonLogicOperator {
            name = 'op3';
            execute = jest.fn(() => 'mock-with-initializer');
        }

        /**
         *
         */
        it('check with no name', () => {
            const operatorMock = new OperatorMock();

            try {
                sut.addOperator(operatorMock);
            } catch (error) {
                expect(error.message).toBe("name is required for JsonLogicOperator: 'OperatorMock'");
                return;
            }

            throw Error('error must occur when name is not defined');
        });

        /**
         *
         */
        it('check with one parameter', () => {
            const operatorMock = new OperatorMock();
            operatorMock.name = 'op1';

            sut.addOperator(operatorMock);
            sut.transform('{ "op1": [{ "var" : "" }] }', '[1,2,3]');

            expect(operatorMock.execute).toHaveBeenCalled();
            expect(operatorMock.execute.mock.calls.length).toBe(1);
            expect(operatorMock.execute).toHaveBeenLastCalledWith([1, 2, 3]);
        });

        /**
         *
         */
        it('check with two parameter', () => {
            const operatorMock = new OperatorMock();
            operatorMock.name = 'op1';

            sut.addOperator(operatorMock);
            sut.transform('{ "op1": [{ "var" : "" }, 4] }', '[1,2,3]');

            expect(operatorMock.execute).toHaveBeenCalled();
            expect(operatorMock.execute.mock.calls.length).toBe(1);
            expect(operatorMock.execute).toHaveBeenLastCalledWith([1, 2, 3], 4);
        });

        /**
         *
         */
        it('check with one name', () => {
            const operatorMock = new OperatorMock();
            operatorMock.name = 'op1';

            sut.addOperator(operatorMock);
            sut.transform('{ "op1": [{ "var" : "" }, 4]  }', '[1,2,3]');

            expect(operatorMock.execute).toHaveBeenCalled();
            expect(operatorMock.execute.mock.calls.length).toBe(1);
            expect(operatorMock.execute).toHaveBeenLastCalledWith([1, 2, 3], 4);
        });

        /**
         *
         */
        it('check with many names', () => {
            const operatorMock = new OperatorMock();
            operatorMock.name = ['op1', 'op2'];

            sut.addOperator(operatorMock);
            sut.transform('{ "op1":  1  }', null);

            expect(operatorMock.execute).toHaveBeenCalled();
            expect(operatorMock.execute.mock.calls.length).toBe(1);
            expect(operatorMock.execute).toHaveBeenLastCalledWith(1);

            sut.transform('{ "op2":  2  }', null);

            expect(operatorMock.execute).toHaveBeenCalled();
            expect(operatorMock.execute.mock.calls.length).toBe(2);
            expect(operatorMock.execute).toHaveBeenLastCalledWith(2);
        });

        /**
         *
         */
        it('check with initializer decorator', () => {
            const result = sut.transform('{ "op3": [{ "var" : "" }, 4]  }', '[1,2,3]');
            expect(result).toBe('mock-with-initializer');
        });
    });
});
