/* globals gauge*/
'use strict';

const {
    RestCallTableHandler,
    TestDescriptionTableHandler,
    RestAuthorizeTableHandler,
    RabbitBindTableHandler,
    RabbitPublishTableHandler,
    RabbitConsumeTableHandler
} = require('@boart/basic');
const { Store, Runtime, RuntimeStatus } = require('@boart/core');

/**
 *
 */
beforeSuite(async () => {
    Store.instance.initGlobalStore(gauge.dataStore.suiteStore);
    Store.instance.initLocalStore(gauge.dataStore.specStore);
    Store.instance.initTestStore(gauge.dataStore.scenarioStore);
});

/**
 *
 */
beforeSuite((context) => {
    Runtime.instance.runtime.notifyStart({
        name: context.projectName
    });
});

/**
 *
 */
afterSuite((context) => {
    Runtime.instance.runtime.notifyEnd({
        stackTrace: context.stackTrace,
        errorMessage: context.errorMessage
    });
});

/**
 *
 */
beforeSpec((context) => {
    Runtime.instance.localRuntime.notifyStart({
        name: context.currentSpec.name,
        location: context.currentSpec.fileName,
        tags: context.currentSpec.tags
    });
});

/**
 *
 */
afterSpec((context) => {
    Runtime.instance.localRuntime.notifyEnd({
        stackTrace: context.currentSpec.stackTrace,
        errorMessage: context.currentSpec.errorMessage,
        status: RuntimeStatus.status(context.currentSpec.isFailed)
    });
});

/**
 *
 */
beforeScenario((context) => {
    Runtime.instance.testRuntime.notifyStart({
        name: context.currentScenario.name,
        location: context.currentSpec.fileName,
        tags: context.currentScenario.tags
    });
});

/**
 *
 */
afterScenario((context) => {
    Runtime.instance.testRuntime.notifyEnd({
        stackTrace: context.currentScenario.stackTrace,
        errorMessage: context.currentScenario.errorMessage,
        status: RuntimeStatus.status(context.currentScenario.isFailed)
    });
});

/**
 *
 */
beforeStep((context) => {
    Runtime.instance.stepRuntime.notifyStart({
        name: context.currentStep.step.actualStepText,
        location: context.currentSpec.fileName,
        tags: []
    });
});

/**
 *
 */
afterStep((context) => {
    Runtime.instance.stepRuntime.notifyEnd({
        stackTrace: context.currentStep.stackTrace,
        errorMessage: context.currentStep.errorMessage,
        status: RuntimeStatus.status(context.currentStep.isFailed)
    });
});

/**
 *
 */
const restcallTableHandler = new RestCallTableHandler();
step('Rest call <table>', async (table) => {
    await restcallTableHandler.handler.process(table);
});

step('Rest call, continue <table>', { continueOnFailure: true }, async (table) => {
    await restcallTableHandler.handler.process(table);
});

/**
 *
 */
const restauthorizeTableHandler = new RestAuthorizeTableHandler();
step('Rest authorize <table>', async (table) => {
    await restauthorizeTableHandler.handler.process(table);
});

step('Rest authorize, continue <table>', { continueOnFailure: true }, async (table) => {
    await restauthorizeTableHandler.handler.process(table);
});

/**
 *
 */
const rabbitBindTableHandler = new RabbitBindTableHandler();
step('RabbitMQ bind <table>', async (table) => {
    await rabbitBindTableHandler.handler.process(table);
});

step('RabbitMQ bind, continue <table>', { continueOnFailure: true }, async (table) => {
    await rabbitBindTableHandler.handler.process(table);
});

/**
 *
 */
const rabbitPublishTableHandler = new RabbitPublishTableHandler();
step('RabbitMQ publish <table>', async (table) => {
    await rabbitPublishTableHandler.handler.process(table);
});

step('RabbitMQ publish, continue <table>', { continueOnFailure: true }, async (table) => {
    await rabbitPublishTableHandler.handler.process(table);
});

/**
 *
 */
const rabbitConsumeTableHandler = new RabbitConsumeTableHandler();
step('RabbitMQ consume <table>', async (table) => {
    await rabbitConsumeTableHandler.handler.process(table);
});

step('RabbitMQ consume, continue <table>', { continueOnFailure: true }, async (table) => {
    await rabbitConsumeTableHandler.handler.process(table);
});

/**
 *
 */
const testDescriptionTableHandler = new TestDescriptionTableHandler();
step('Test description <table>', async (table) => {
    await testDescriptionTableHandler.handler.process(table);
});

/**
 *
 */
step('Check store', () => {
    gauge.dataStore.scenarioStore;
    console.log(Object.keys(gauge.dataStore.scenarioStore.store));
    console.log('test store', gauge.dataStore.scenarioStore);
});
