import { Context, NativeContent, NullContent, Runtime, RuntimeStatus, StepContext, Store } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';

import { RunNotExecutionUnit } from './ExecutionUnit.RunNot';
import { RunOnlyExecutionUnit } from './ExecutionUnit.RunOnly';

/**
 *
 */
beforeEach(() => {
    Runtime.instance.stepRuntime.current = new StepContext();
    Runtime.instance.stepRuntime.current.status = RuntimeStatus.succeed;
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
        ['match single marker - continue running', 'marker', 'marker', RuntimeStatus.succeed],
        ['match multiple marker - whitespace - continue running', 'markerX marker', 'marker', RuntimeStatus.succeed],
        ['match multiple marker - colon - continue running', 'markerX,marker', 'marker', RuntimeStatus.succeed],
        ['match multiple marker - colon and whitespace - continue running', 'markerX , marker', 'marker', RuntimeStatus.succeed],
        ['match multiple marker - semicolon - continue running', 'markerX ; marker', 'marker', RuntimeStatus.succeed],
        ['match multiple marker - | - continue running', 'markerX | marker', 'marker', RuntimeStatus.succeed],
        ['whitespace', 'markerX \t marker', 'marker', RuntimeStatus.succeed],
        ['not matching', 'markerX  markerY', 'marker', RuntimeStatus.stopped]
    ])('%s', (_, value, actionPara, expected) => {
        sut.execute(null, {
            value,
            actionPara
        } as RowTypeValue<AnyContext>);

        expect(Runtime.instance.stepRuntime.current.status).toBe(expected);
    });

    /**
     *
     */
    it('with parameter', () => {
        sut.execute(null, {
            value: 'a:1:2',
            actionPara: 'a'
        } as RowTypeValue<AnyContext>);

        expect(Context.instance.get('arg1').valueOf()).toBe(1);
        expect(Context.instance.get('arg2').valueOf()).toBe(2);
    });

    /**
     *
     */
    it('with parameter, but not matching', () => {
        sut.execute(null, {
            value: 'a:1:2',
            actionPara: 'b'
        } as RowTypeValue<AnyContext>);

        expect(Context.instance.get('arg1')).toBeNull();
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
    ])('%s', (_, value, actionPara, expected) => {
        sut.execute(null, {
            value,
            actionPara
        } as RowTypeValue<AnyContext>);

        expect(Runtime.instance.stepRuntime.current.status).toBe(expected);
    });
});
