import { Property } from './Property';

/**
 *
 */
export class PropertyIterable implements IterableIterator<Property> {
    readonly completePath: string;

    /**
     *
     */
    constructor(private keys: string[], path?: string) {
        this.completePath = path || keys.join('.');
    }

    /**
     *
     */
    public get path(): string {
        return this.keys.join('.');
    }

    /**
     *
     */
    public toArray(): Array<Property> {
        return Array.from(this);
    }

    /**
     *
     */
    public next(): IteratorResult<Property, Property> {
        const done = this.keys?.length <= 0;
        const key = this.keys.shift();
        return {
            done,
            value: new Property(key, this.completePath)
        };
    }

    /**
     *
     */
    public nofirst(): PropertyIterable {
        return new PropertyIterable(this.keys.slice(1), this.completePath);
    }

    /**
     *
     */
    public noLast(): PropertyIterable {
        return new PropertyIterable(this.keys.slice(0, -1), this.completePath);
    }

    /**
     *
     */
    public last(): Property {
        return new Property(this.keys.at(-1), this.completePath);
    }

    /**
     *
     */
    public first(): Property {
        return new Property(this.keys.at(0), this.completePath);
    }

    /**
     *
     */
    public get length(): number {
        return this.keys.length;
    }

    [Symbol.iterator](): IterableIterator<Property> {
        return this;
    }
}
