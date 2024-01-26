import { ArraySubject } from './ArraySubject';

/**
 *
 */
describe('check array subject', () => {
    /**
     *
     */
    it('one subscribers before', (done) => {
        let iterator = 0;

        const sut = new ArraySubject<string>();
        const expectedValues = ['a', 'b', 'c'];

        sut.asObservable().subscribe((item) => {
            expect(item).toBe(expectedValues[iterator++]);
            if (iterator >= expectedValues.length) {
                done();
            }
        });

        sut.next('a');
        sut.next('b');
        sut.next('c');
        sut.complete();
    });

    /**
     *
     */
    it('one subscribers after', (done) => {
        let iterator = 0;

        const sut = new ArraySubject<string>();
        const expectedValues = ['a', 'b', 'c'];

        sut.next('a');
        sut.next('b');
        sut.next('c');
        sut.complete();

        sut.subscribe((item) => {
            expect(item).toBe(expectedValues[iterator++]);
            if (iterator >= expectedValues.length) {
                done();
            }
        });
    });

    /**
     *
     */
    it('one subscribers in the middle', (done) => {
        let iterator = 0;

        const sut = new ArraySubject<string>();
        const expectedValues = ['a', 'b', 'c'];

        sut.next('a');
        sut.next('b');
        sut.subscribe((item) => {
            expect(item).toBe(expectedValues[iterator++]);
            if (iterator >= expectedValues.length) {
                done();
            }
        });

        sut.next('c');
        sut.complete();
    });

    /**
     *
     */
    it('one subscribers in the middle (object subscriber)', (done) => {
        let iterator = 0;

        const sut = new ArraySubject<string>();
        const expectedValues = ['a', 'b', 'c'];

        sut.next('a');
        sut.next('b');
        sut.subscribe({
            next: (item) => expect(item).toBe(expectedValues[iterator++]),
            error: () => done(),
            complete: () => done()
        });

        sut.next('c');
        sut.complete();
    });

    /**
     *
     */
    it('two subscribers', (done) => {
        const checkDone = (count1: number, count2: number) => {
            if (count1 === 2 && count2 === 2) {
                done();
            }
        };

        let firstSubscriberIterator = 0;
        let secondSubscriberIterator = 0;

        const sut = new ArraySubject<string>();
        const expectedValues = ['a', 'b'];

        sut.next('a');
        sut.asObservable().subscribe((item) => {
            expect(item).toBe(expectedValues[firstSubscriberIterator++]);
            checkDone(firstSubscriberIterator, secondSubscriberIterator);
        });
        sut.next('b');

        sut.asObservable().subscribe((item) => {
            expect(item).toBe(expectedValues[secondSubscriberIterator++]);
            checkDone(firstSubscriberIterator, secondSubscriberIterator);
        });
    });
});
