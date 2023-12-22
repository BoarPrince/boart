import { Context, Runtime, RuntimeStatus, StepContext, Store, VariableParser } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';

import { RunNotExecutionUnit } from './ExecutionUnit.RunNot';
import { RunOnlyExecutionUnit } from './ExecutionUnit.RunOnly';

/**
 *
 */
const variableParser = new VariableParser();

/**
 *
 */
beforeEach(() => {
    Runtime.instance.stepRuntime.currentContext = new StepContext();
    Runtime.instance.stepRuntime.currentContext.status = RuntimeStatus.succeed;
});

/**
 *
 */
describe('run:only', () => {
    /**
     *
     */
    const sut = new RunOnlyExecutionUnit();

    /**
     *
     */
    beforeEach(() => {
        Store.instance.stepStore.clear();
    });

    /**
     *
     */
    it.each([
        [1, 'match single marker - continue running', 'marker', 'run:only:marker', RuntimeStatus.succeed],
        [2, 'match multiple marker - whitespace - continue running', 'markerX marker', 'run:only:marker', RuntimeStatus.succeed],
        [3, 'match multiple marker - colon - continue running', 'markerX,marker', 'run:only:marker', RuntimeStatus.succeed],
        [
            4,
            'match multiple marker - colon and whitespace - continue running',
            'markerX , marker',
            'run:only:marker',
            RuntimeStatus.succeed
        ],
        [5, 'match multiple marker - semicolon - continue running', 'markerX ; marker', 'run:only:marker', RuntimeStatus.succeed],
        [6, 'match multiple marker - | - continue running', 'markerX | marker', 'run:only:marker', RuntimeStatus.succeed],
        [7, 'whitespace', 'markerX \t marker', 'run:only:marker', RuntimeStatus.succeed],
        [8, 'not matching', 'markerX  markerY', 'run:only:marker', RuntimeStatus.stopped]
    ])('%s - %s', (_, __, value, actionPara, expected) => {
        sut.execute(null, {
            value,
            ast: variableParser.parseAction(actionPara)
        } as RowTypeValue<AnyContext>);

        expect(Runtime.instance.stepRuntime.currentContext.status).toBe(expected);
    });

    /**
     *
     */
    it('with parameter', () => {
        sut.execute(null, {
            value: 'a:1:2',
            ast: variableParser.parseAction('run:only:a')
        } as RowTypeValue<AnyContext>);

        const ast1 = variableParser.parseAction('context:arg1');
        expect(Context.instance.get(ast1).valueOf()).toBe(1);

        const ast2 = variableParser.parseAction('context:arg2');
        expect(Context.instance.get(ast2).valueOf()).toBe(2);
    });

    /**
     *
     */
    it('with parameter, but not matching', () => {
        sut.execute(null, {
            value: 'a:1:2',
            ast: variableParser.parseAction('run:only:b')
        } as RowTypeValue<AnyContext>);

        const ast1 = variableParser.parseAction('context:arg1');
        expect(Context.instance.get(ast1)).toBeNull();
    });
});

/**
 *
 */
describe('run:not', () => {
    /**
     *
     */
    const sut = new RunNotExecutionUnit();

    /**
     *
     */
    it.each([
        ['match single marker - stop running', 'marker', 'marker', RuntimeStatus.stopped],
        ['match multiple marker - whitespace - stop running', 'markerX marker', 'marker', RuntimeStatus.stopped],
        ['match multiple marker - colon - stop running', 'markerX,marker', 'marker', RuntimeStatus.stopped],
        ['match multiple marker - colon and whitespace - stop running', 'markerX , marker', 'marker', RuntimeStatus.stopped],
        ['match multiple marker - semicolon - stop running', 'markerX ; marker', 'marker', RuntimeStatus.stopped],
        ['match multiple marker - | - stop running', 'markerX | marker', 'marker', RuntimeStatus.stopped],
        ['whitespace', 'markerX \t marker', 'marker', RuntimeStatus.stopped],
        ['not matching', 'markerX  markerY', 'marker', RuntimeStatus.succeed]
    ])('%s', (_, value, marker, expected) => {
        sut.execute(null, {
            value,
            ast: variableParser.parseAction(`run:not:${marker}`)
        } as RowTypeValue<AnyContext>);

        expect(Runtime.instance.stepRuntime.currentContext.status).toBe(expected);
    });
});
