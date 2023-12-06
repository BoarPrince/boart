import { ValueReplaceArg } from '../value/ValueReplacer';

import { Generator } from './Generator';
import { GeneratorHandler } from './GeneratorHandler';

/**
 *
 */
const getAst = (paras: string): ValueReplaceArg => {
    const parasArray = paras.split(':');
    const generator = parasArray.shift();
    return {
        qualifier: {
            value: generator,
            paras: parasArray,
            optional: false,
            stringValue: generator
        },
        match: generator
    };
};

/**
 *
 */
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
        expect(() => sut.add('g1', generator)).toThrow(`generator 'g1' already exists!`);
    });

    /**
     *
     */
    it('call generator with wrong definition', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        expect(() => sut.generate(getAst('xg1'))).toThrow(`generator 'xg1' can't be found!`);
    });

    /**
     *
     */
    it('call generator with wrong name', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        expect(() => sut.generate(getAst('g2'))).toThrow(`generator 'g2' can't be found!`);
    });

    /**
     *
     */
    it('check simple gnerator call without parameter', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate(getAst('g1'));

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith([]);
    });

    /**
     *
     */
    it('check simple gnerator call with one parameter', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate(getAst('g1:para1'));

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith(['para1']);
    });

    /**
     *
     */
    it('check simple gnerator call with multiple parameters (two)', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate(getAst('g1:para1:para2'));

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith(['para1', 'para2']);
    });

    /**
     *
     */
    it('check simple gnerator call with multiple parameters (three)', () => {
        const generator = new GeneratorMock();

        sut.add('g1', generator);
        sut.generate(getAst('g1:para1:para2:para3'));

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith(['para1', 'para2', 'para3']);
    });

    /**
     *
     */
    it('check faker call', () => {
        const generator = new GeneratorMock();

        sut.add('faker', generator);
        sut.generate(getAst('faker:random.number:min=10:max=99'));

        expect(generator.generate).toHaveBeenCalledTimes(1);
        expect(generator.generate).toHaveBeenCalledWith(['random.number', 'min=10', 'max=99']);
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
        jest.spyOn(sut, 'generate').mockImplementation();
        jest.spyOn(sut, 'add');

        sut.addItems([generator]);
        sut.generate(getAst('g1'));

        expect(sut.add).toHaveBeenCalledTimes(1);
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

        expect(() => sut.generate(getAst('g1'))).toThrow("generator 'g1' can't be found!");
    });
});
