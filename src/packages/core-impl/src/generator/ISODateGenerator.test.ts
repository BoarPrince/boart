import assert from 'assert';

import { ISODateGenerator } from './ISODateGenerator';

describe('isodate generator', () => {
    const sut = new ISODateGenerator();

    /**
     *
     */
    const getDateString = (offset: number): string => {
        const oneDayOffsetInMSec = offset * 24 * 60 * 60 * 1000;
        return new Date(Date.now() + oneDayOffsetInMSec).toDateString();
    };

    it('result of isodate generator must be 19 characters', () => {
        const isodate = sut.generate(['1']);
        expect(isodate).toBeDefined();
        expect(isodate.length).toBe(10);
    });

    it('isodate generator without a paramter must fit to now', () => {
        const isodate = sut.generate(null);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(0));
    });

    it('isodate generator with parameter 1 must have one day offset', () => {
        const isodate = sut.generate(['1']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(1));
    });

    it('isodate generator with parameter 1 must have two day offset', () => {
        const isodate = sut.generate(['2']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(2));
    });

    it('isodate generator with parameter 1 must have five day offset', () => {
        const isodate = sut.generate(['5']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(5));
    });

    it('isodate generator with parameter 1 must have hundred day offset', () => {
        const isodate = sut.generate(['100']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(100));
    });

    it('isodate generator with parameter 1 must have one day negative offset', () => {
        const isodate = sut.generate(['-1']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(-1));
    });

    it('isodate generator with parameter 1 must have two day negative offset', () => {
        const isodate = sut.generate(['-2']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(-2));
    });

    it('isodate generator with parameter 1 must have five day negative offset', () => {
        const isodate = sut.generate(['-5']);
        const generator_date = new Date(isodate);
        expect(generator_date.toDateString()).toBe(getDateString(-5));
    });

    it('default with no parameter must have 19 characters', () => {
        const random = sut.generate(null);
        expect(random).toBeDefined();
        expect(random.length).toBe(10);
    });

    it('parameter must be a number', () => {
        try {
            sut.generate(['not a number']);
        } catch (error) {
            expect(error.message).toBe(`iso date generator requires a number parameter. 'not a number' does not fit this requirement.`);
            return;
        }

        assert.fail('if parameter is not a number an error must thrown');
    });
});
