import { DefaultProxy } from './DefaultProxy';
import { DefaultPositionProxyActions } from './DefaultPositionProxyActions';
import { ElementAdapter, ElementPosition, UIElementProxyActions, UIElementTableProxy } from '@boart/ui';

/**
 *
 */
export abstract class DefaultTableProxy extends DefaultProxy implements UIElementTableProxy {
    /**
     *
     */
    abstract getRows(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    abstract getColumns(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    abstract getVisibleRows(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    abstract getVisibleColumns(element: ElementAdapter): Promise<number>;

    /**
     *
     */
    public actions = (position: ElementPosition): UIElementProxyActions => new DefaultPositionProxyActions(position, this);
}
