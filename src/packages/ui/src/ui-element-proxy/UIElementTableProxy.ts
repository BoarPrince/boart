import { ElementAdapter } from '../element-adapter/ElementAdapter';
import { ElementPosition } from './ElementPosition';
import { UIElementProxy } from './UIElementProxy';
import { UIElementProxyActions } from './UIElementProxyActions';

/**
 *
 */
export interface UIElementTableProxy extends UIElementProxy {
    /**
     *
     */
    actions: (position: ElementPosition) => UIElementProxyActions;

    /**
     *
     */
    getRows(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    getColumns(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    getVisibleRows(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    getVisibleColumns(element: ElementAdapter): Promise<number>;
}
