import { ExecutionContext } from '../execution/ExecutionContext';
import { BaseRowMetaDefinition } from './BaseRowMetaDefinition';
import { BaseRowType } from './BaseRowType';
import { TableHandlerBaseImpl } from './TableHandlerBaseImpl';

/**
 *
 */
class TestExecutionContext implements ExecutionContext<object, object, object> {
    config: object;
    preExecution: object;
    execution: object;
}

/**
 *
 */
export class TestRowType<TExecutionContext extends ExecutionContext<object, object, object>> {
    constructor(readonly data: BaseRowMetaDefinition<TExecutionContext, BaseRowType<TExecutionContext>>) {}
}

/**
 *
 */
jest.mock('./TableHandler', () => ({
    TableHandler: class MockHandler {
        constructor() {}
    }
}));

/**
 *
 */
class TableHandlerTestImpl extends TableHandlerBaseImpl<TestExecutionContext, TestRowType<TestExecutionContext>> {
    rowType = jest.fn();
    mainExecutionUnit = jest.fn();
    newContext = jest.fn();
    addGroupRowDefinition = jest.fn();
    addRowDefinition = jest.fn();
    addGroupValidation = jest.fn();
}

/**
 *
 */
it('use handler the first time', () => {
    const sut = new TableHandlerTestImpl();
    const handler = sut.handler;

    expect(sut.rowType).toBeCalledTimes(1);
    expect(sut.mainExecutionUnit).toBeCalledTimes(1);

    expect(sut.addGroupRowDefinition).toBeCalledTimes(1);
    expect(sut.addGroupRowDefinition).toBeCalledWith(handler);

    expect(sut.addRowDefinition).toBeCalledTimes(1);
    expect(sut.addRowDefinition).toBeCalledWith(handler);

    expect(sut.addGroupValidation).toBeCalledTimes(1);
    expect(sut.addGroupValidation).toBeCalledWith(handler);
});
