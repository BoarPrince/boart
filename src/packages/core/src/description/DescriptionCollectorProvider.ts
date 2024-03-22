import { DescriptionCollector } from './DescriptionCollector';

/**
 *
 */
export interface DescriptionCollectorProvider {
    /**
     *
     */
    getDescriptionCollector(): DescriptionCollector;
}
