import { PluginReportItem } from './PluginReportItem';

/**
 *
 */
export interface PluginResponse {
    execution: {
        data: unknown;
        header: unknown;
    };
    reportItems: Array<PluginReportItem>;
}
