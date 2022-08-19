/* globals gauge*/
'use strict';

const { RestCallTableHandler } = require('@boart/basic');
const { Store, Runtime, RuntimeStatus } = require('@boart/core');

const restcallTableHandler = new RestCallTableHandler();

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
step('Rest call <table>', async (table) => {
    await restcallTableHandler.handler.process(table);
});

/**
 *
 */
step('Hallo', () => {
    console.log('hallo');
});

/**
 *
 */
step('Hallo <number>', (number) => {
    console.log('hallo', number);
});
