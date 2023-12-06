import assert from 'assert';

import { DateTimeGenerator } from './DateTimeGenerator';

describe('dateTime generator', () => {
    const sut = new DateTimeGenerator();

    /**
     *
     */
    const getTimeString = (offset: number): string => {
        const oneDayOffsetInMSec = offset * 24 * 60 * 60 * 1000;
        return new Date(Date.now() + oneDayOffsetInMSec).toTimeString();
    };

    it('result of dateTime generator must be 19 characters', () => {
        const datetime = sut.generate(['1']);
        expect(datetime).toBeDefined();
        expect(datetime.length).toBe(19);
    });

    it('dateTime generator without a paramter must fit to now', () => {
        const datetime = sut.generate([]);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(0));
    });

    it('dateTime generator with parameter 1 must have one day offset', () => {
        const datetime = sut.generate(['1']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(1));
    });

    it('dateTime generator with parameter 1 must have two day offset', () => {
        const datetime = sut.generate(['2']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(2));
    });

    it('dateTime generator with parameter 1 must have five day offset', () => {
        const datetime = sut.generate(['5']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(5));
    });

    it('dateTime generator with parameter 1 must have hundred day offset', () => {
        const datetime = sut.generate(['100']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(100));
    });

    it('dateTime generator with parameter 1 must have one day negative offset', () => {
        const datetime = sut.generate(['-1']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(-1));
    });

    it('dateTime generator with parameter 1 must have two day negative offset', () => {
        const datetime = sut.generate(['-2']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(-2));
    });

    it('dateTime generator with parameter 1 must have five day negative offset', () => {
        const datetime = sut.generate(['-5']);
        const generator_date = new Date(datetime);
        expect(generator_date.toTimeString()).toBe(getTimeString(-5));
    });

    it('default with no parameter must have 19 characters', () => {
        const random = sut.generate(null);
        expect(random).toBeDefined();
        expect(random.length).toBe(19);
    });

    it('parameter must be a number', () => {
        try {
            sut.generate(['not a number']);
        } catch (error) {
            expect(error.message).toBe(`datetime generator requires a number parameter. 'not a number' does not fit this requirement.`);
            return;
        }

        assert.fail('if parameter is not a number an error must thrown');
    });
});
