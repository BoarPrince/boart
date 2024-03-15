import { ElementAdapter } from '@boart/ui';
import { LocatorAdapterType } from './LocatorAdapterType';

/**
 *
 */
export class SeleniumElementLocatorAdapter implements ElementAdapter {
    /**
     *
     */
    private readonly _nativeElement: LocatorAdapterType;

    /**
     *
     */
    public get nativeElement(): LocatorAdapterType {
        return this._nativeElement;
    }

    /**
     *
     */
    constructor(nativeElement: LocatorAdapterType) {
        this._nativeElement = nativeElement;
    }

    /**
     *
     */
    getId(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public isDisplayed(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public isEnabled(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public isAccessible(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public getTagName(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    public getParent(): Promise<ElementAdapter> {
        return null;
    }

    /**
     *
     */
    public getXPath(): Promise<string> {
        return Promise.resolve('/');
    }
}
