interface NamingItem {
    readonly name: string;
}

/**
 *
 */
export interface Initializer<Item extends NamingItem> {
    /**
     * removes all items.
     */
    clear();

    /**
     * removes a specific item
     */
    delete(name: string);

    /**
     * adds a new item
     */
    add(name: string, item: Item): Initializer<Item>;

    /**
     *
     * add new items
     */
    addItems(items: ReadonlyArray<Item>): Initializer<Item>;
}
