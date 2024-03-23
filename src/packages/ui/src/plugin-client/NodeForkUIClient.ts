import { PluginRequest, PluginResponse } from '@boart/core';
import { NodeForkClient } from '@boart/plugin';
import { WebPageAdapterHandler } from '../web-page-adapter/WebPageAdapterHandler';
import { ElementAdapter } from '../element-adapter/ElementAdapter';

/**
 *
 */
export class NodeForkUIClient {
    private client: NodeForkClient;

    /**
     *
     */
    constructor() {
        this.client = new NodeForkClient();
    }

    /**
     *
     */
    public start() {
        this.client.start();
    }

    /**
     *
     */
    public stop() {
        // await pageAdapter.driver.clear();
    }

    public async init() {
        // initialize();
        const pageAdapterCreator = WebPageAdapterHandler.instance.getPageAdapterCreator('selenium.chromium.standalone');
        const pageAdapter = await pageAdapterCreator();

        this.client.pluginHandler.addExecutionUnit({
            action: 'value',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                const value = request.value.toString();
                let element: ElementAdapter;

                if (request.action.ast.qualifier.paras?.length === 1) {
                    const location = request.action.ast.qualifier.paras[0];
                    element = await pageAdapter.element.locator.find(location);
                } else {
                    const strategy = request.action.ast.qualifier.paras[0];
                    const location = request.action.ast.qualifier.paras[1];
                    element = await pageAdapter.element.locator.findBy(strategy, location);
                }

                await pageAdapter.element.setValue(value, element);
                return null;
            }
        });

        this.client.pluginHandler.addExecutionUnit({
            action: 'page:open',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                await pageAdapter.driver.open(request.value.toString());
                return null;
            }
        });

        this.client.pluginHandler.addExecutionUnit({
            action: 'page:html',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                await pageAdapter.driver.html(request.value.toString());
                return null;
            }
        });
    }
}
