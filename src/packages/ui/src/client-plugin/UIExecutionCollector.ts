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
        if (this.pageAdapter) {
            throw new Error(`collector already started`);
        }
        const pageAdapterCreator = WebPageAdapterHandler.instance.getPageAdapterCreator('selenium.chromium.standalone');
        this.pageAdapter = await pageAdapterCreator();

        this.pluginHandler.setMainExecutionUnit({
            execute: (): Promise<PluginResponse> => null
        });

        /**
         *
         */
        const findElement = async (
            request: PluginRequest,
            errorMessage?: string
        ): Promise<{ locationId: string; element: ElementAdapter }> => {
            try {
                const location = request.action.ast.selectors?.match ?? request.additionalValue.toString();

                if (request.action.ast.qualifier?.value) {
                    const strategy = request.action.ast.qualifier.value;
                    return {
                        locationId: location,
                        element: await this.pageAdapter.element.locator.findBy(strategy, location)
                    };
                } else {
                    return {
                        locationId: location,
                        element: (await this.pageAdapter.element.locator.find(location)).element
                    };
                }
            } catch (error) {
                errorMessage = errorMessage ?? `element for action '${request.action.name}' not found!`;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                error.message = `${errorMessage}\n${error.message}`;
                throw error;
            }
        };

        /**
         * #### V A L U E ####
         */
        this.pluginHandler.addExecutionUnit({
            action: this.pageAdapter.element.locator.strategies.map((s) => `value:${s}`).concat('value'),
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                const element = await findElement(request);
                const value = request.value.toString();
                await this.pageAdapter.element.setValue(value, element.element);
                return null;
            }
        });

        /**
         * #### I N F O ####
         */
        this.pluginHandler.addExecutionUnit({
            action: this.pageAdapter.element.locator.strategies.map((s) => `info:${s}`).concat('info'),
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                const element = await findElement(request);
                const info = await this.pageAdapter.element.getElementInfo(element.element);

                const locationId = request.value ? request.value.toString() : element.locationId;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                request.context.execution.data['info'][locationId] = info;
                return null;
            }
        });

        /**
         * #### P A G E : O P E N ####
         */
        this.pluginHandler.addExecutionUnit({
            action: 'page:open',
            execute: async (request: PluginRequest): Promise<PluginResponse> => {
                await this.pageAdapter.driver.open(request.value.toString());
                return null;
            }
        });

        /**
         * #### P A G E : H T M L ####
         */
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
