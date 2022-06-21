import { Observer, Subject, Subscription } from 'rxjs';

/**
 *
 */
export class ArraySubject<T> extends Subject<T> {
    private items: T[] = [];

    /**
     *
     */
    clear(): void {
        this.items = [];
    }

    /**
     *
     */
    next(value: T): void {
        this.items.push(value);
        super.next(value);
    }

    /**
     *
     */
    subscribe(
        observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
        error?: ((error: unknown) => void) | null,
        complete?: (() => void) | null
    ): Subscription {
        if (!(observerOrNext as Partial<Observer<T>>).next) {
            this.items.forEach((item) => (observerOrNext as (value: T) => void)(item));
            return super.subscribe({
                next: (v) => (observerOrNext as (value: T) => void)(v),
                error,
                complete
            });
        } else {
            this.items.forEach((item) => (observerOrNext as Partial<Observer<T>>).next(item));
            return super.subscribe(observerOrNext as Partial<Observer<T>>);
        }
    }

    /**
     *
     */
    toArray(): ReadonlyArray<T> {
        return this.items;
    }
}
