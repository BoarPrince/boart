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
