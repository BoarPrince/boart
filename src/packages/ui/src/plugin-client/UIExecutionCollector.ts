import { ExecutionUnitPluginHandler, PluginExecutionCollector, PluginRequest, PluginResponse } from '@boart/core';
import { WebPageAdapterHandler } from '../web-page-adapter/WebPageAdapterHandler';
import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { WebPageAdapter } from '../web-page-adapter/WebPageAdapter';

/**
 *
 */
export class UIExecutionCollector implements PluginExecutionCollector {
    public readonly pluginHandler: ExecutionUnitPluginHandler;
    private pageAdapter: WebPageAdapter<unknown>;

    /**
     *
     */
    constructor() {
        this.pluginHandler = new ExecutionUnitPluginHandler();
    }

    /**
     *
     */
    public async start(): Promise<void> {
        const pageAdapterCreator = WebPageAdapterHandler.instance.getPageAdapterCreator('selenium.chromium.standalone');
        this.pageAdapter = await pageAdapterCreator();

        this.pluginHandler.addExecutionUnit({
            action: 'value',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                const value = request.value.toString();
                const location = request.additionalValue.toString();
                let element: ElementAdapter;

                if (request.action.ast.qualifier.paras?.length === 1) {
                    const strategy = request.action.ast.qualifier.paras[0];
                    element = await this.pageAdapter.element.locator.findBy(strategy, location);
                } else {
                    element = await this.pageAdapter.element.locator.find(location);
                }

                await this.pageAdapter.element.setValue(value, element);
                return null;
            }
        });

        this.pluginHandler.addExecutionUnit({
            action: 'page:open',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                await this.pageAdapter.driver.open(request.value.toString());
                return null;
            }
        });

        this.pluginHandler.addExecutionUnit({
            action: 'page:html',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                await this.pageAdapter.driver.html(request.value.toString());
                return null;
            }
        });
    }

    /**
     *
     */
    public async stop(): Promise<void> {
        await this.pageAdapter.driver.clear();
    }
}
