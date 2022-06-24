import { NativeContent, NullContent, ObjectContent, TextContent } from '@boart/core';
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check textcontent', () => {
        const result = sut.check(new TextContent('aba'), '.b.');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check textcontent false', () => {
        const result = sut.check(new TextContent('aba'), '.c.');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent('aba'), 'b');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), 'c');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), 'c');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), 'd');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), 'c');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), 'd');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent(''), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent([]), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', () => {
        const result = sut.check(new ObjectContent({}), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', () => {
        const result = sut.check(new NativeContent(2), '');
        expect(result).toBeFalsy();
    });
});

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * C O U N T
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
describe('equal', () => {
    const sut = ExpectedOperatorImplementation.count;

    /**
     *
     */
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', () => {
        const result = sut.check(new NullContent(), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent('aaa'), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', () => {
        const result = sut.check(new NativeContent(2), '2');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', () => {
        const result = sut.check(new NullContent(), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check null / 1', () => {
        const result = sut.check(new NullContent(), '1');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string equal', () => {
        const result = sut.check(new TextContent('aaa'), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string greater', () => {
        const result = sut.check(new TextContent('aaa'), '2');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array equal', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array greater', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '2');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object equal', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object greater', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '2');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', () => {
        const result = sut.check(new NativeContent(2), '2');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', () => {
        const result = sut.check(new NullContent(), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check null / -1', () => {
        const result = sut.check(new NullContent(), '-1');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string equal', () => {
        const result = sut.check(new TextContent('aaa'), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string smaller', () => {
        const result = sut.check(new TextContent('aaa'), '4');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '2');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array equal', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array smaller', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '4');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '2');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '0');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object equal', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '3');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object smaller', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '4');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '2');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', () => {
        const result = sut.check(new NativeContent(2), '2');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', () => {
        const result = sut.check(new NullContent(), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / -1', () => {
        const result = sut.check(new NullContent(), '-1');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string equal', () => {
        const result = sut.check(new TextContent('aaa'), '3');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string greater', () => {
        const result = sut.check(new TextContent('aaa'), '2');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array equal', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '3');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array greater', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '2');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object equal', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '3');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object greater', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '2');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '4');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number greater', () => {
        const result = sut.check(new NativeContent(3), '2');
        expect(result).toBeTruthy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 0', () => {
        const result = sut.check(new NullContent(), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check null / 1', () => {
        const result = sut.check(new NullContent(), '1');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string equal', () => {
        const result = sut.check(new TextContent('aaa'), '3');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string smaller', () => {
        const result = sut.check(new TextContent('aaa'), '4');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '2');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array equal', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '3');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array smaller', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '4');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array false 1', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '2');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false 2', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object equal', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '3');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object smaller', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '4');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '2');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '0');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number smaller', () => {
        const result = sut.check(new NativeContent(3), '4');
        expect(result).toBeTruthy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent('aaa'), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object equal', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
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
    it('check string', () => {
        const result = sut.check(new TextContent('aaa'), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array empty', () => {
        const result = sut.check(new ObjectContent([]), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object empty', () => {
        const result = sut.check(new ObjectContent({}), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check object equal', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check undefined', () => {
        const result = sut.check(new NativeContent(undefined), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent(''), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent([]), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', () => {
        const result = sut.check(new ObjectContent({}), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number <> 0', () => {
        const result = sut.check(new NativeContent(2), '');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check undefined', () => {
        const result = sut.check(new NativeContent(undefined), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent(''), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string, containing number', () => {
        const result = sut.check(new TextContent('1'), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent([]), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array false', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', () => {
        const result = sut.check(new ObjectContent({}), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object false', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check number 0', () => {
        const result = sut.check(new NativeContent(0), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check number <> 0', () => {
        const result = sut.check(new NativeContent(2), '');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check boolean false', () => {
        const result = sut.check(new NativeContent(false), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check boolean true', () => {
        const result = sut.check(new NativeContent(true), '');
        expect(result).toBeFalsy();
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
    it('check null', () => {
        const result = sut.check(new NullContent(), '');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check string', () => {
        const result = sut.check(new TextContent('aba'), 'ab');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string - native content', () => {
        const result = sut.check(new NativeContent('aba'), 'ab');
        expect(result).toBeTruthy();
    });

    /**
     *
     */
    it('check string false', () => {
        const result = sut.check(new TextContent('aba'), 'c');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check array', () => {
        const result = sut.check(new ObjectContent(['a', 'b', 'c']), 'c');
        expect(result).toBeFalsy();
    });

    /**
     *
     */
    it('check object', () => {
        const result = sut.check(new ObjectContent({ a: 1, b: 1, c: 1 }), 'c');
        expect(result).toBeFalsy();
    });
});
