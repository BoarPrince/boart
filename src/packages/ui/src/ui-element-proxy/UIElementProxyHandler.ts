import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { UIElementProxy } from './UIElementProxy';

/**
 *
 */
export class UIElementProxyHandler {
    private proxies = new Map<string, Array<UIElementProxy>>();

    /**
     *
     */
    private constructor() {}

    /**
     *
     */
    public static get instance(): UIElementProxyHandler {
        if (!globalThis._uiElementProxyHandler) {
            const instance = new UIElementProxyHandler();
            globalThis._uiElementProxyHandler = instance;
        }

        return globalThis._uiElementProxyHandler;
    }

    /**
     *
     */
    public addProxy(tagName: string, ...proxies: Array<UIElementProxy>) {
        const proxyList = this.proxies.has(tagName)
            ? this.proxies.get(tagName)
            : this.proxies.set(tagName, new Array<UIElementProxy>()).get(tagName);

        proxies.forEach((proxy) => {
            if (proxyList.find((p) => p.name === proxy.name)) {
                throw new Error(`proxy ${proxy.name} already exists`);
            }
            proxyList.push(proxy);
        });

        this.proxies.set(
            tagName,
            proxyList.sort((p1, p2) => p2.order - p1.order)
        );
    }

    /**
     *
     */
    async getProxy(element: ElementAdapter): Promise<UIElementProxy> {
        const tagName = await element.getTagName();
        const proxies = this.proxies
            .get(tagName) //
            .concat(this.proxies.get('*'));

        if (!proxies) {
            throw new Error(`no proxy supported for tagName: '${tagName}'`);
        }

        if (proxies.length === 1) {
            return proxies[0];
        } else {
            const sortedProxies = proxies.sort((p1, p2) => p2.order - p1.order);
            for (const proxy of sortedProxies) {
                if (await proxy.isMatching(element)) {
                    return proxy;
                }
            }

            return null;
        }
    }

    /**
     *
     */
    public async getElementsByText(text: string, parentElement: ElementAdapter): Promise<ElementAdapter[]> {
        const proxies = Array.from(this.proxies.values()).flatMap((proxy) => proxy);

        const elements = new Array<ElementAdapter>();
        for (const proxy of proxies) {
            try {
                const proxyElement = await proxy.getElementByMatchingText(text, parentElement);
                elements.push(proxyElement);
            } catch (error) {
                throw new Error(`cannot locate element with text: '${text}', proxy: ${proxy.name}\n${error}`);
            }
        }

        return elements;
    }
}
