/* globals gauge*/
'use strict';

const {
    RestCallTableHandler,
    TestDescriptionTableHandler,
    RestAuthorizeTableHandler,
    RabbitBindTableHandler,
    RabbitPublishTableHandler,
    RabbitConsumeTableHandler,
    DataTableHandler,
    RabbitListenerTableHandler,
    SQLQueryTableHandler
} = require('@boart/basic');
const { DescriptionHandler, Store, ValueReplacerHandler, Runtime, RuntimeStatus } = require('@boart/core');
const { DescriptionGenerator } = require('@boart/description');

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

// /**
//  *
//  */
// afterStep(() => {
//     DescriptionHandler.instance.describe();
//     // process.stdout.destroy(); // = stream.Writable();
//     // process.stderr.destroy(); // = stream.Writable();
//     process.exit(0);
// });

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
const rabbitListenerTableHandler = new RabbitListenerTableHandler();
step('RabbitMQ listening <table>', async (table) => {
    await rabbitListenerTableHandler.handler.process(table);
});

step('RabbitMQ listening, continue <table>', { continueOnFailure: true }, async (table) => {
    await rabbitListenerTableHandler.handler.process(table);
});

/**
 *
 */
const sqlQueryTableHandler = new SQLQueryTableHandler();
step('SQL query <table>', async (table) => {
    await sqlQueryTableHandler.handler.process(table);
});

step('SQL query, continue <table>', { continueOnFailure: true }, async (table) => {
    await sqlQueryTableHandler.handler.process(table);
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
const dataTableHandler = new DataTableHandler();
step('Data manage <table>', async (table) => {
    await dataTableHandler.handler.process(table);
});

/**
 *
 */
step('Data manage, continue <table>', { continueOnFailure: true }, async (table) => {
    await dataTableHandler.handler.process(table);
});

/**
 *
 */
step('Save value: <value> to store: <store>', (value, store) => {
    const resolved_value = ValueReplacerHandler.replace(value);
    const resolved_store = ValueReplacerHandler.replace(store);
    gauge.dataStore.scenarioStore.put(resolved_store, resolved_value);
});

/**
 *
 */
step('Print store', () => {
    console.log(' ');
    const keys = Object.keys(gauge.dataStore.scenarioStore.store);
    keys.forEach((key) => console.log('key: ', key));
    console.log(' ');

    keys.forEach((key) => {
        let value;
        try {
            value = JSON.stringify(gauge.dataStore.scenarioStore.get(key));
        } catch (error) {
            value = gauge.dataStore.scenarioStore.get(key);
        }
        console.log('*****', key, '******** :');
        console.log(' ');
        console.log(value);
    });
});

/**
 *
 */
step('Console.log <message>', (message) => {
    console.log('#### log ####', message);
});

/**
 *
 */
step('Wait <seconds>', async (seconds) => {
    const duration = parseInt(seconds);

    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration * 1000);
    });
});

/**
 *
 */
step('Generate Documentation', () => {
    DescriptionHandler.instance.save();
    DescriptionGenerator.instance.create();
});