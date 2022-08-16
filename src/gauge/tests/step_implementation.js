/* globals gauge*/
"use strict";

const { RestCallTableHandler } = require('@boart/basic');
const { Store } = require('@boart/core');

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
step("Rest call <table>", async (table) => {
    await restcallTableHandler.handler.process(table);
});
