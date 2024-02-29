/**
 *
 */
export interface ElementProxy {
    /**
     *
     */
    readonly nativeElement: unknown;

    /**
     *
     */
    getParent(): Promise<ElementProxy> | null;

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

    // /**
    //  *
    //  */
    // isAccessible(): Promise<boolean>;
}
