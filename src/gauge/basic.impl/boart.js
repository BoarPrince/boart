/* globals gauge*/
'use strict'

const { DescriptionHandler, Store, ValueReplacerHandler, Runtime, RuntimeStatus, TableHandlerInstances } = require('@boart/core')
const { DescriptionGenerator } = require('@boart/description')

/**
 *
 */
beforeSuite(async () => {
    Store.instance.initGlobalStore(gauge.dataStore.suiteStore)
    Store.instance.initLocalStore(gauge.dataStore.specStore)
    Store.instance.initTestStore(gauge.dataStore.scenarioStore)
})

/**
 *
 */
beforeSuite(context => {
    Runtime.instance.runtime.notifyStart({
        name: context.projectName
    });

    for(const [name, handler] of TableHandlerInstances.instance.values) {
      step(`${name} <table>`, async table => {
          await handler.process(table)
      });

      step(`${name}, continue <table>`, { continueOnFailure: true }, async table => {
          await handler.process(table)
      });
    }
})

/**
 *
 */
afterSuite(context => {
    Runtime.instance.runtime.notifyEnd({
        stackTrace: context.stackTrace,
        errorMessage: context.errorMessage
    })
})

/**
 *
 */
beforeSpec(context => {
    Runtime.instance.localRuntime.notifyStart({
        name: context.currentSpec.name,
        location: context.currentSpec.fileName,
        tags: context.currentSpec.tags
    })
})

/**
 *
 */
afterSpec(context => {
    Runtime.instance.localRuntime.notifyEnd({
        stackTrace: context.currentSpec.stackTrace,
        errorMessage: context.currentSpec.errorMessage,
        status: RuntimeStatus.status(context.currentSpec.isFailed)
    })
})

/**
 *
 */
beforeScenario(context => {
    Runtime.instance.testRuntime.notifyStart({
        name: context.currentScenario.name,
        location: context.currentSpec.fileName,
        tags: context.currentScenario.tags
    })
})

/**
 *
 */
afterScenario(context => {
    Runtime.instance.testRuntime.notifyEnd({
        stackTrace: context.currentScenario.stackTrace,
        errorMessage: context.currentScenario.errorMessage,
        status: RuntimeStatus.status(context.currentScenario.isFailed)
    })
})

/**
 *
 */
beforeStep(context => {
    Runtime.instance.stepRuntime.notifyStart({
        name: context.currentStep.step.actualStepText,
        location: context.currentSpec.fileName,
        tags: []
    })
})

/**
 *
 */
afterStep(context => {
    Runtime.instance.stepRuntime.notifyEnd({
        stackTrace: context.currentStep.stackTrace,
        errorMessage: context.currentStep.errorMessage,
        status: RuntimeStatus.status(context.currentStep.isFailed)
    })
})

/**
 *
 */
step('Save value: <value> to store: <store>', (value, store) => {
    const resolved_value = ValueReplacerHandler.replace(value)
    const resolved_store = ValueReplacerHandler.replace(store)
    gauge.dataStore.scenarioStore.put(resolved_store, resolved_value)
})

/**
 *
 */
step('Print store', () => {
    console.log(' ')
    const keys = Object.keys(gauge.dataStore.scenarioStore.store)
    keys.forEach(key => console.log('key: ', key))
    console.log(' ')

    keys.forEach(key => {
        let value
        try {
            value = JSON.stringify(gauge.dataStore.scenarioStore.get(key))
        } catch (error) {
            value = gauge.dataStore.scenarioStore.get(key)
        }
        console.log('*****', key, '******** :')
        console.log(' ')
        console.log(value)
    })
})

/**
 *
 */
step('Console.log <message>', message => {
    console.log('#### log ####', message)
})

/**
 *
 */
step('Wait <seconds>', async seconds => {
    const duration = parseInt(seconds)

    return new Promise(resolve => {
        setTimeout(() => resolve(), duration * 1000)
    })
})

/**
 *
 */
step('Generate Documentation', () => {
    DescriptionHandler.instance.save()
    DescriptionGenerator.instance.create()
})
