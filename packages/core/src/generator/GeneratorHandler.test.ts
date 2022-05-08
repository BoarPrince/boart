import assert from 'assert';
import { Generator } from './Generator';
import { GeneratorHandler } from './GeneratorHandler';

describe('check generatorHandler', () => {
    const sut = GeneratorHandler.instance;

    /**
     *
     */
    class GeneratorMock implements Generator {
        name = 'MockGenerator';
        generate = jest.fn();
    }

    /**
     *
     */
    beforeEach(() => {
        sut.clear();
    });

    /**
     *
     */
    it('add same generator mulitple times', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        try {
            sut.add('g1', generator);
        } catch (error) {
            expect(error.message).toBe(`generator 'g1' already exists!`);
            return;
        }

        assert.fail('if adding the same generator multiple times, an error must be thrown');
    });

    /**
     *
     */
    it('call generator with wrong definition', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        try {
            sut.generate(':g1');
        } catch (error) {
            expect(error.message).toBe(`generator definition ':g1' can't be resolved!`);
            return;
        }

        assert.fail('calling generator with a wrong definition must throw an error');
    });

    /**
     *
     */
    it('call generator with wrong name', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        try {
            sut.generate('g2');
        } catch (error) {
            expect(error.message).toBe(`generator 'g2' can't be found!`);
            return;
        }

        assert.fail('if generator cant be found, an error must be thrown');
    });

    /**
     *
     */
    it('check simple gnerator call without parameter', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate('g1');

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith('');
    });

    /**
     *
     */
    it('check simple gnerator call with one parameter', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate('g1:para1');

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith('para1');
    });

    /**
     *
     */
    it('check simple gnerator call with multiple parameters (two)', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate('g1:para1:para2');

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith('para1', 'para2');
    });

    /**
     *
     */
    it('check simple gnerator call with multiple parameters (three)', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate('g1:para1:para2:para3');

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith('para1', 'para2', 'para3');
    });

    /**
     *
     */
    it('check faker call', () => {
        const generator = new GeneratorMock();

        sut.add('faker', generator);
        sut.generate('faker:random.number:min=10:max=99');

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith('random.number', 'min=10', 'max=99');
    });

    /**
     *
     */
    it('check adding generator with addItems (null)', () => {
        sut.addItems(null);
    });

    /**
     *
     */
    it('check adding generator with addItems', () => {
        const generator: Generator = {
            name: 'g1',
            generate: jest.fn()
        };
        sut.generate = jest.fn();
        jest.spyOn(sut, 'add');

        sut.addItems([generator]);
        sut.generate('g1');

        expect(sut.add).toBeCalledTimes(1);
        expect(sut.add).toHaveBeenCalledWith('g1', generator);
        expect(sut.generate).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    it('check deleting item', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.delete('g1');
        try {
            sut.generate('g1');
            return;
        } catch (error) {
            expect(error.message).toBe("generator 'g1' can't be found!");
            return;
        }
        assert.fail('error must be thrown if generator cant be found');
    });
});
