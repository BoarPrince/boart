/**
 *
 */
export interface UIElementProxyInfo {
    ident: string;
    tagName: string;
    proxyName: string;
    value: string;
    text: string;
    classes: Array<string>;
    isReadonly: boolean;
    isRequired: boolean;
    isDisplayed: boolean;
    isEnabled: boolean;
    isEditable: boolean;
    isSelected: boolean;
    tableInfo?: {
        columns: number;
        rows: number;
        visibleRows: number;
        visibleColumns: number;
    };
}
