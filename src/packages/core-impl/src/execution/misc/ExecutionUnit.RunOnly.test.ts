import { Runtime, RuntimeStatus, StepContext } from '@boart/core';

import { AnyContext } from '../../AnyContext';
import { RowTypeValue } from '../../RowTypeValue';

import { RunOnlyExecutionUnit } from './ExecutionUnit.RunOnly';

/**
 *
 */
const sut = new RunOnlyExecutionUnit();

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
