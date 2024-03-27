import { ArraySubject } from './common/ArraySubject';
import { EnvLoader } from './common/EnvLoader';
import { JsonHelper } from './common/JsonHelper';
import { Semaphore } from './common/Semaphore';
import { TextLanguageHandler } from './common/TextLanguageHandler';
import { Timer } from './common/Timer';
import { UrlLoader } from './common/UrlLoader';
import { ContentInstance } from './data/ContentInstance';
import { ContentType } from './data/ContentType';
import { DataContent } from './data/DataContent';
import DataContentBase from './data/DataContentBase';
import { DataContentHelper } from './data/DataContentHelper';
import { DataType } from './data/DataType.enum';
import { NativeContent } from './data/NativeContent';
import { NativeType } from './data/NativeType';
import { NullContent } from './data/NullContent';
import { ObjectContent } from './data/ObjectContent';
import { SelectorExtractor } from './data/SelectorExtractor';
import { TextContent } from './data/TextContent';
import { Description } from './description/Description';
import { DescriptionHandler } from './description/DescriptionHandler';
import { ExpectedDescription } from './description/ExpectedDescription';
import { FullDescription } from './description/FullDescription';
import { ExecutionContext } from './execution/ExecutionContext';
import { ExecutionEngine } from './execution/ExecutionEngine';
import { ExecutionUnit } from './execution/ExecutionUnit';
import { ExecutionUnitValidation } from './execution/ExecutionUnitValidation';
import { RepeatableExecutionContext } from './execution/RepeatableExecutionContext';
import { ExpectedOperator, ExpectedOperatorResult } from './expected/ExpectedOperator';
import { ExpectedOperatorInitializer } from './expected/ExpectedOperatorInitializer';
import { Generator } from './generator/Generator';
import { GeneratorHandler } from './generator/GeneratorHandler';
import { VariableParser } from './parser/VariableParser';
import { ASTAction } from './parser/ast/ASTAction';
import { ASTValue } from './parser/ast/ASTValue';
import { ASTVariable } from './parser/ast/ASTVariable';
import { SelectorType as ASTSelectorType } from './parser/ast/SelectorType';
import { LocalContext } from './runtime/LocalContext';
import { Runtime } from './runtime/Runtime';
import { RuntimeResultContext } from './runtime/RuntimeResultContext';
import { RuntimeContext } from './runtime/RuntimeContext';
import { RuntimePriority } from './runtime/RuntimePriority';
import { RuntimeStatus } from './runtime/RuntimeStatus';
import { StepContext } from './runtime/StepContext';
import { TestContext } from './runtime/TestContext';
import { Context } from './store/Context';
import { Store } from './store/Store';
import { StoreMap } from './store/StoreMap';
import { StoreWrapper } from './store/StoreWrapper';
import { BaseRowMetaDefinition } from './table/BaseRowMetaDefinition';
import { BaseRowType } from './table/BaseRowType';
import { GroupRowDefinition } from './table/GroupRowDefinition';
import { MarkdownTableReader } from './table/MarkdownTableReader';
import { RowDefinition } from './table/RowDefinition';
import { TableHandler } from './table/TableHandler';
import { TableHandlerBaseImpl } from './table/TableHandlerBaseImpl';
import { TableHandlerInstances } from './table/TableHandlerInstances';
import { key, value } from './table/TableRowDecorator';
import { TableRowType } from './table/TableRowType';
import { TableRows } from './table/TableRows';
import { ParaType } from './types/ParaType';
import { ScopeType } from './types/ScopeType';
import { ScopedType } from './types/ScopedType';
import { SelectorType } from './types/SelectorType';
import { GroupValidator } from './validators/GroupValidator';
import { RowValidator } from './validators/RowValidator';
import { ValidatorFactory } from './validators/ValidatorFactory';
import { ValidatorFactoryManager } from './validators/ValidatorFactoryManager';
import { ValidationHandler } from './validators/ValidationHandler';
import { OperatorType } from './value/OperatorType';
import { ValueReplaceArg, ValueReplacer, ValueReplacerConfig } from './value/ValueReplacer';
import { ValueReplacerHandler } from './value/ValueReplacerHandler';
import { ObjectValidator } from './validators/object/ObjectValidator';
import { DefaultRowType } from './default/DefaultRowType';
import { DefaultPropertySetterExecutionUnit } from './default/DefaultPropertySetterExecutionUnit';
import {
    DefaultContext,
    DefaultExecutionContext,
    DefaultPreExecutionContext,
    ReadonlyDefaultContext
} from './default/DefaultExecutionContext';
import { ExecutionUnitPluginFactory } from './plugin/ExecutionUnitPluginFactory';
import { RuntimeStartUp } from './configuration/schema/RuntimeStartUp';
import { ValidatorType } from './validators/ValidatorType';
import { DirectExecutionPluginFactory } from './plugin/DirectExecutionPluginFactory';
import { ExecutionUnitPlugin } from './plugin/ExecutionUnitPlugin';
import { PluginRequest } from './plugin/PluginRequest';
import { PluginResponse } from './plugin/PluginResponse';
import { ExecutionUnitPluginHandler } from './plugin/ExecutionUnitPluginHandler';
import { ExecutionUnitPluginFactoryHandler } from './plugin/ExecutionUnitPluginFactoryHandler';
import { LocalReport } from './report/LocalReport';
import { StepReport } from './report/StepReport';
import { TestReport } from './report/TestReport';
import { Descriptionable } from './description/Descriptionable';
import { DescriptionCollectorProvider } from './description/DescriptionCollectorProvider';
import { DescriptionCollector } from './description/DescriptionCollector';
import { DescriptionCollectorHandler } from './description/DescriptionCollectorHandler';
import { PluginClient } from './plugin/PluginClient';
import { PluginClientDefault } from './plugin/PluginClientDefault';
import { PluginExecutionCollector } from './plugin/PluginExecutionCollector';
import { RemotePluginRequest } from './plugin/RemotePluginRequest';
import { RemotePluginResponse } from './plugin/RemotePluginResponse';
import { LocalExecutionPluginFactory } from './plugin/LocalExecutionPluginFactory';
import { PluginExecutionCollectorHandler } from './plugin/PluginExecutionCollectorHandler';
import { PluginHostDefault } from './plugin/PluginHostDefault';
import { PluginExecutionUnitConfig } from './configuration/schema/PluginExecutionUnitConfig';
import { ExecutionType } from './configuration/schema/ExecutionType';
import { ConfigurationParser } from './configuration/ConfigurationParser';

/**
 *
 */
export {
    ArraySubject,
    ASTAction,
    ASTSelectorType,
    ASTValue,
    ASTVariable,
    BaseRowMetaDefinition,
    BaseRowType,
    ContentInstance,
    ContentType,
    Context,
    ConfigurationParser,
    DataContent,
    DataContentBase,
    DataContentHelper,
    DataType,
    DefaultContext,
    DefaultExecutionContext,
    DefaultPreExecutionContext,
    DefaultPropertySetterExecutionUnit,
    DefaultRowType,
    Description,
    Descriptionable,
    DescriptionHandler,
    DescriptionCollector,
    DescriptionCollectorProvider,
    DescriptionCollectorHandler,
    EnvLoader,
    ExecutionContext,
    ExecutionEngine,
    ExecutionUnit,
    ExecutionUnitPlugin,
    ExecutionUnitPluginFactory,
    ExecutionUnitPluginHandler,
    ExecutionUnitPluginFactoryHandler,
    ExecutionUnitValidation,
    ExecutionType,
    ExpectedDescription,
    ExpectedOperator,
    ExpectedOperatorInitializer,
    ExpectedOperatorResult,
    FullDescription,
    Generator,
    GeneratorHandler,
    GroupRowDefinition,
    GroupValidator,
    JsonHelper,
    key,
    LocalContext,
    MarkdownTableReader,
    NativeContent,
    NativeType,
    NullContent,
    ObjectContent,
    ObjectValidator,
    OperatorType,
    ParaType,
    PluginRequest,
    PluginResponse,
    PluginClient,
    PluginClientDefault,
    PluginExecutionCollector,
    PluginExecutionCollectorHandler,
    PluginHostDefault,
    PluginExecutionUnitConfig,
    RemotePluginRequest,
    RemotePluginResponse,
    RepeatableExecutionContext,
    ReadonlyDefaultContext,
    LocalReport,
    StepReport,
    TestReport,
    RowDefinition,
    RowValidator,
    Runtime,
    RuntimeContext,
    RuntimePriority,
    RuntimeResultContext,
    RuntimeStartUp,
    RuntimeStatus,
    ScopedType,
    ScopeType,
    SelectorExtractor,
    SelectorType,
    Semaphore,
    StepContext,
    Store,
    StoreMap,
    StoreWrapper,
    TableHandler,
    TableHandlerBaseImpl,
    TableHandlerInstances,
    TableRows,
    TableRowType,
    TestContext,
    TextContent,
    TextLanguageHandler,
    Timer,
    UrlLoader,
    ValidationHandler,
    ValidatorFactory,
    ValidatorFactoryManager,
    ValidatorType,
    value,
    ValueReplaceArg as ReplaceArg,
    ValueReplaceArg,
    ValueReplacer,
    ValueReplacerConfig,
    ValueReplacerHandler,
    VariableParser
};

/**
 *
 */
function initialize(): void {
    if (globalThis._coreInitialized) {
        // call initialize only once a time
        return;
    } else {
        globalThis._coreInitialized = true;
    }

    ExecutionUnitPluginFactoryHandler.instance.addFactory('direct', new DirectExecutionPluginFactory());
    ExecutionUnitPluginFactoryHandler.instance.addFactory('local', new LocalExecutionPluginFactory());
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();
