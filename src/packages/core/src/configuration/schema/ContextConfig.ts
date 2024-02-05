/**
 *
 */
export interface ContextConfig {
    config: object;
    pre: object;
    execution: {
        data: object;
        transformed: object;
        header: object;
    };
}
