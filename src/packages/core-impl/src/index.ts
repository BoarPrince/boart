import { GeneratorHandler, ValidatorFactoryManager, ValueReplacerHandler } from '@boart/core';
import { AnyContext } from './AnyContext';
import { PDFContent } from './data/PDFContent';
import { ExpectedDataExecutinoUnit } from './execution/expected/ExecutionUnit.ExpectedData';
import { ExpectedJsonLogicExecutionUnit } from './execution/expected/ExecutionUnit.ExpectedJsonLogic';
import { ExpectedOperatorImplementation } from './execution/expected/ExpectedOperator.Implementation';
import { DescriptionExecutionUnit } from './execution/misc/ExecutionUnit.Description';
import { GroupExecutionUnit } from './execution/misc/ExecutionUnit.Group';
import { LinkExecutionUnit } from './execution/misc/ExecutionUnit.Link';
import { OutStoreExecutionUnit } from './execution/misc/ExecutionUnit.OutStore';
import { WaitExecutionUnit } from './execution/misc/ExecutionUnit.Wait';
import { RunEnvExecutionUnit } from './execution/run/ExecutionUnit.RunEnv';
import { RunNotExecutionUnit } from './execution/run/ExecutionUnit.RunNot';
import { RunNotEmptyExecutionUnit } from './execution/run/ExecutionUnit.RunNotEmpty';
import { RunOnlyExecutionUnit } from './execution/run/ExecutionUnit.RunOnly';
import { TransformJPathExecutionUnit } from './execution/transform/ExecutionUnit.TransformJPath';
import { TransformJsonLogicExecutionUnit } from './execution/transform/ExecutionUnit.TransformJsonLogic';
import { TransformResetExecutionUnit } from './execution/transform/ExecutionUnit.TransformReset';
import { CharGenerator } from './generator/CharGenerator';
import { DateTimeGenerator } from './generator/DateTimeGenerator';
import { FakeGenerator } from './generator/FakeGenerator';
import { HexGenerator } from './generator/HexGenerator';
import { ISODateGenerator } from './generator/ISODateGenerator';
import { IbanGenerator } from './generator/IbanGenerator';
import { RandomGenerator } from './generator/RandomGenerator';
import { TemplateGenerator } from './generator/TemplateGenerator';
import { TimestampGenerator } from './generator/TimestampGenerator';
import { UUIDGenerator } from './generator/UUIDGenerator';
import { BoolValidator } from './validators/BoolValidator';
import { DependsOnValidator } from './validators/DependsOnValidator';
import { DependsOnValueValidator } from './validators/DependsOnValueValidator';
import { IntValidator } from './validators/IntValidator';
import { QualifierValidator } from './validators/QualifierValidator';
import { RequiredValidator } from './validators/RequiredValidator';
import { UniqueValidator } from './validators/UniqueValidator';
import { ValueRequiredValidator } from './validators/ValueRequiredValidator';
import { ValueValidator } from './validators/ValueValidator';
import { XORValidator } from './validators/XORValidator';
import { ContextReplacer } from './value/ContextReplacer';
import { EnvironmentReplacer } from './value/EnvironmentReplacer';
import { FileReplacer } from './value/FileReplacer';
import { GenerateReplacer } from './value/GenerateReplacer';
import { ReferenceReplacer } from './value/ReferenceReplacer';
import { StoreReplacer } from './value/StoreReplacer';
import { TextReplacer } from './value/TextReplacer';
import { DataScopeValidator } from './validators/DataScopeValidator';
import { QualifierParaValidator } from './validators/QualifierParaValidator';
import { initialize as basicDataGroupDefinitionInitialize } from './basicGroup/BasicDataGroupDefinition';
import { initialize as basicGroupDefinitionInitialize } from './basicGroup/BasicGroupDefinition';

/**
 *
 */
export {
    AnyContext,
    BoolValidator,
    ContextReplacer,
    CharGenerator,
    DateTimeGenerator,
    DependsOnValidator,
    DependsOnValueValidator,
    DescriptionExecutionUnit,
    EnvironmentReplacer,
    ExpectedDataExecutinoUnit,
    ExpectedJsonLogicExecutionUnit,
    FakeGenerator,
    FileReplacer,
    GenerateReplacer,
    GroupExecutionUnit,
    HexGenerator,
    IbanGenerator,
    IntValidator,
    ISODateGenerator,
    OutStoreExecutionUnit,
    LinkExecutionUnit,
    PDFContent,
    QualifierValidator,
    RandomGenerator,
    ReferenceReplacer,
    RequiredValidator,
    RunOnlyExecutionUnit,
    RunEnvExecutionUnit,
    RunNotExecutionUnit,
    RunNotEmptyExecutionUnit,
    StoreReplacer,
    TemplateGenerator,
    TextReplacer,
    TimestampGenerator,
    TransformJPathExecutionUnit,
    TransformJsonLogicExecutionUnit,
    TransformResetExecutionUnit,
    UniqueValidator,
    UUIDGenerator,
    ValueRequiredValidator,
    ValueValidator,
    WaitExecutionUnit,
    XORValidator
};

/**
 *
 */
export default function initialize(): void {
    if (globalThis._coreImplInitialized) {
        // call initialize only once a time
        return;
    } else {
        globalThis._coreImplInitialized = true;
    }

    // initialize
    ExpectedOperatorImplementation.addAll();

    ValueReplacerHandler.instance.add('store', new StoreReplacer());
    ValueReplacerHandler.instance.add('env', new EnvironmentReplacer());
    ValueReplacerHandler.instance.add('text', new TextReplacer());
    ValueReplacerHandler.instance.add('generate', new GenerateReplacer());
    ValueReplacerHandler.instance.add('ref', new ReferenceReplacer());
    ValueReplacerHandler.instance.add('context', new ContextReplacer());
    ValueReplacerHandler.instance.add('file', new FileReplacer());

    ValidatorFactoryManager.instance.addFactories([
        BoolValidator.factory(),
        DataScopeValidator.factory(),
        DependsOnValidator.factory(),
        IntValidator.factory(),
        QualifierParaValidator.factory(),
        QualifierValidator.factory(),
        RequiredValidator.factory(),
        UniqueValidator.factory(),
        ValueRequiredValidator.factory(),
        ValueValidator.factory(),
        XORValidator.factory()
    ]);

    GeneratorHandler.instance.addItems([
        new CharGenerator(),
        new DateTimeGenerator(),
        new FakeGenerator(),
        new TemplateGenerator(),
        new HexGenerator(),
        new IbanGenerator(),
        new ISODateGenerator(),
        new RandomGenerator(),
        new TimestampGenerator(),
        new UUIDGenerator()
    ]);

    basicDataGroupDefinitionInitialize();
    basicGroupDefinitionInitialize();
}

// eslint-disable-next-line jest/require-hook
(() => initialize())();
