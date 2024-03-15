/**
 *
 */
export interface ElementAdapter {
    /**
     *
     */
    readonly nativeElement: unknown;

    /**
     *
     */
    getId(): Promise<string>;

    /**
     *
     */
    getParent(): Promise<ElementAdapter> | null;

    /**
     *
     */
    getTagName(): Promise<string>;

    /**
     *
     */
    getXPath(): Promise<string>;

    /**
     *
     */
    isDisplayed(): Promise<boolean>;

    /**
     *
     */
    isEnabled(): Promise<boolean>;

    /**
     *
     */
    isAccessible(): Promise<boolean>;
}
