import 'jest-extended';

import { ExpectedOperatorImplementation } from './ExpectedOperator.Implementation';

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * R E G E X P
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('regexp', () => {
    const sut = ExpectedOperatorImplementation.regexp;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check textcontent', async () => {
        const result = await sut.check('aba', '.b.');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check textcontent false', async () => {
        const result = await sut.check('aba', '.c.');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * C O N T A I N S
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('contains', () => {
    const sut = ExpectedOperatorImplementation.contains;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('aba', 'b');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', 'c');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], 'c');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false', async () => {
        const result = await sut.check(['a', 'b', 'c'], 'd');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, 'c');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object with null values', async () => {
        const result = await sut.check({ a: null, b: 1, c: 1 }, null);
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object with null values - but not existing', async () => {
        const result = await sut.check({ a: null, b: 1, c: 1 }, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, 'd');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number', async () => {
        const result = await sut.check(232, '3');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * C O N T A I N S  K E Y
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('containsKey', () => {
    const sut = ExpectedOperatorImplementation.containsKey;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('aba', 'b');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], 'a');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object value', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '1');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, 'c');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check objects in array', async () => {
        const result = await sut.check([{ a: 1, b: 1, c: 1 }, { c: 2 }], 'c');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check objects in array, but not all entries contains the key', async () => {
        const result = await sut.check([{ a: 1, b: 1, c: 1 }, { d: 2 }], 'c');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * E M P T Y
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('empty', () => {
    const sut = ExpectedOperatorImplementation.empty;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('', '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check([], '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({}, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', async () => {
        const result = await sut.check(2, '');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * C O U N T
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('count', () => {
    const sut = ExpectedOperatorImplementation.count;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', async () => {
        const result = await sut.check(null, '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('aaa', '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string containing number', async () => {
        const result = await sut.check('5', '5');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', async () => {
        const result = await sut.check(['a', 'b', 'c'], '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', async () => {
        const result = await sut.check(2, '2');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * C O U N T E Q U A L  O R  G R E A T E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('count:equal-greater', () => {
    const sut = ExpectedOperatorImplementation.countEqualOrGreater;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', async () => {
        const result = await sut.check(null, '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check null / 1', async () => {
        const result = await sut.check(null, '1');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string equal', async () => {
        const result = await sut.check('aaa', '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string greater', async () => {
        const result = await sut.check('aaa', '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array equal', async () => {
        const result = await sut.check(['a', 'b', 'c'], '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array greater', async () => {
        const result = await sut.check(['a', 'b', 'c'], '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', async () => {
        const result = await sut.check(['a', 'b', 'c'], '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object equal', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object greater', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', async () => {
        const result = await sut.check(2, '2');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * C O U N T  E Q U A L  O R  S M A L L E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('count:equal-smaller', () => {
    const sut = ExpectedOperatorImplementation.countEqualOrSmaller;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', async () => {
        const result = await sut.check(null, '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check null / -1', async () => {
        const result = await sut.check(null, '-1');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string equal', async () => {
        const result = await sut.check('aaa', '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string smaller', async () => {
        const result = await sut.check('aaa', '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '2');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array equal', async () => {
        const result = await sut.check(['a', 'b', 'c'], '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array smaller', async () => {
        const result = await sut.check(['a', 'b', 'c'], '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', async () => {
        const result = await sut.check(['a', 'b', 'c'], '2');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '0');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object equal', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '3');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object smaller', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '2');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', async () => {
        const result = await sut.check(2, '2');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * G R E A T E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('greater', () => {
    const sut = ExpectedOperatorImplementation.greater;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', async () => {
        const result = await sut.check(null, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / -1', async () => {
        const result = await sut.check(null, '-1');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string equal', async () => {
        const result = await sut.check('aaa', '3');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string greater', async () => {
        const result = await sut.check('aaa', '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array equal', async () => {
        const result = await sut.check(['a', 'b', 'c'], '3');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array greater', async () => {
        const result = await sut.check(['a', 'b', 'c'], '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', async () => {
        const result = await sut.check(['a', 'b', 'c'], '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object equal', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '3');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object greater', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '4');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number greater', async () => {
        const result = await sut.check(3, '2');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check date greater', async () => {
        const result = await sut.check('2019-01-25T09:03:31.205Z', '2019-01-25T09:03:31.204Z');
        expect(result.result).toBeTruthy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * S M A E L L E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('smaller', () => {
    const sut = ExpectedOperatorImplementation.smaller;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', async () => {
        const result = await sut.check(null, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 1', async () => {
        const result = await sut.check(null, '1');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string equal', async () => {
        const result = await sut.check('aaa', '3');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string smaller', async () => {
        const result = await sut.check('aaa', '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '2');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array equal', async () => {
        const result = await sut.check(['a', 'b', 'c'], '3');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array smaller', async () => {
        const result = await sut.check(['a', 'b', 'c'], '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', async () => {
        const result = await sut.check(['a', 'b', 'c'], '2');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object equal', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '3');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object smaller', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '2');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '0');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number smaller', async () => {
        const result = await sut.check(3, '4');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check date smaller', async () => {
        const result = await sut.check('2019-01-25T09:03:31.203Z', '2019-01-25T09:03:31.204Z');
        expect(result.result).toBeTruthy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * I S  A R R A Y
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('IsArray', () => {
    const sut = ExpectedOperatorImplementation.isArray;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('aaa', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object equal', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * I S  O B J E C T
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('IsObject', () => {
    const sut = ExpectedOperatorImplementation.isObject;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    // reset array
    // | var:value:null | carriers        |                                             |

    // add complex structure
    // * Convert2 content

    // | action    | property        | value                    |
    // |-----------|-----------------|--------------------------|
    // | in        |                 | ${store:company_payload} |
    // | var:value | carriers#0      | ${store:carrier_payload} |
    // | out:store | company_payload |                          |

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('aaa', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', async () => {
        const result = await sut.check([], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', async () => {
        const result = await sut.check({}, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check object equal', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * I S   N U L L
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('isNull', () => {
    const sut = ExpectedOperatorImplementation.isNull;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check undefined', async () => {
        const result = await sut.check(undefined, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check([], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({}, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', async () => {
        const result = await sut.check(2, '');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * I S   N U M B E R
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('isNumber', () => {
    const sut = ExpectedOperatorImplementation.isNumber;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check undefined', async () => {
        const result = await sut.check(undefined, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string, containing number', async () => {
        const result = await sut.check('1', '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check mix of string and number', async () => {
        const result = await sut.check('1-a-1', '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check([], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false', async () => {
        const result = await sut.check(['a', 'b', 'c'], '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({}, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object false', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', async () => {
        const result = await sut.check(0, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check number <> 0', async () => {
        const result = await sut.check(2, '');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check boolean false', async () => {
        const result = await sut.check(false, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check boolean true', async () => {
        const result = await sut.check(true, '');
        expect(result.result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * S T A R T S W I T H
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('startsWith', () => {
    const sut = ExpectedOperatorImplementation.startsWith;

    /**
     *
     */
    it('check null', async () => {
        const result = await sut.check(null, '');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', async () => {
        const result = await sut.check('aba', 'ab');
        expect(result.result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', async () => {
        const result = await sut.check('aba', 'c');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', async () => {
        const result = await sut.check(['a', 'b', 'c'], 'c');
        expect(result.result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', async () => {
        const result = await sut.check({ a: 1, b: 1, c: 1 }, 'c');
        expect(result.result).toBeFalsy();
    });
});
