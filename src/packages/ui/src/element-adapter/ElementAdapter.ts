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
    getParent(): Promise<ElementAdapter> | null;

    /**
     *
     */
    getTagName(): Promise<string>;

    /**
     *
     */
    getXPath(): Promise<string>;

    // /**
    //  *
    //  */
    // isDisplayed(): Promise<boolean>;

    // /**
    //  *
    //  */
    // isEnabled(): Promise<boolean>;
}
