
/**
 *
 */
export type DescriptionCodeExampleType = 'json' | 'javascript';
export type DescriptionCodeExamplePosition = 'before' | 'after';

/**
 *
 */

export interface DescriptionCodeExample {
    title: string;
    type: DescriptionCodeExampleType;
    position: DescriptionCodeExamplePosition;
    code: string;
}
