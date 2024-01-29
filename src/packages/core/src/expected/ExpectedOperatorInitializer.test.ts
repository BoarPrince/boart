import { ExpectedOperatorResult } from './ExpectedOperator';
import { ExpectedOperatorInitializer } from './ExpectedOperatorInitializer';

/**
 *
 */
describe('extended operation generation', () => {
    /**
     *
     */
    beforeEach(() => {
        ExpectedOperatorInitializer.instance.clear();
    });

    /**
     *
     */
    it('not generation', () => {
        const sut = ExpectedOperatorInitializer.instance;

        sut.addOperator({
            name: 'test-op',
            caseInsesitive: true,
            check: (): ExpectedOperatorResult => null
        });

        expect(sut.operators).toBeArrayOfSize(4);
    });

    /**
     *
     */
    it('not and others generation - with ci', () => {
        const sut = ExpectedOperatorInitializer.instance;

        sut.addOperator({
            name: 'test-op',
            caseInsesitive: true,
            check: (): ExpectedOperatorResult => null
        });

        const operators = sut.operators.map((operator) => operator.name);

        expect(operators).toStrictEqual(['test-op', 'test-op:not', 'test-op:ci', 'test-op:ci:not']);
    });

    /**
     *
     */
    it('not and others generation - without ci', () => {
        const sut = ExpectedOperatorInitializer.instance;

        sut.addOperator({
            name: 'test-op',
            caseInsesitive: false,
            check: (): ExpectedOperatorResult => null
        });

        const operators = sut.operators.map((operator) => operator.name);

        expect(operators).toStrictEqual(['test-op', 'test-op:not']);
    });

    /**
     *
     */
    it('not and others generation with description titles', () => {
        const sut = ExpectedOperatorInitializer.instance;

        sut.addOperator({
            name: 'test-op',
            caseInsesitive: true,
            check: (): ExpectedOperatorResult => null,
            description: () => ({
                id: '-id-',
                title: '-title-',
                description: '--desc--',
                examples: null
            })
        });

        const descriptionTitles = sut.operators //
            .map((operator) => operator.description())
            .map((desc) => desc.title);

        expect(descriptionTitles).toStrictEqual(['-title-', '-title-:not', '-title-:ci', '-title-:ci:not']);
    });

    /**
     *
     */
    it('not and others generation with description short titles', () => {
        const sut = ExpectedOperatorInitializer.instance;

        sut.addOperator({
            name: 'test-op',
            caseInsesitive: true,
            check: (): ExpectedOperatorResult => null,
            description: () => ({
                id: '-id-',
                title: '-title-',
                titleShort: '-title-short-',
                description: '--desc--',
                examples: null
            })
        });

        const descriptionTitles = sut.operators //
            .map((operator) => operator.description())
            .map((desc) => desc.titleShort);

        expect(descriptionTitles).toStrictEqual(['-title-short-', 'not', 'ci', 'ci:not']);
    });
});
