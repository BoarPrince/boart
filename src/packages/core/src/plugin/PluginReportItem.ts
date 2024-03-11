/**
 *
 */
export interface PluginReportItem {
    description: string;
    dataType: 'json' | 'text';
    type: 'payload' | 'header' | 'input' | 'unknown';
    data: string | object;
}
