/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest-extended';

declare global {
    /**
     *
     */
    interface Console {
        readonly message: (...args: readonly unknown[]) => void;
    }

    /**
     *
     */
    interface Gauge<T> {
        readonly dataStore: {
            readonly suiteStore: any;
            readonly specStore: any;
            readonly scenarioStore: any;
        };
        readonly message: (text: string) => void;
    }

    /**
     *
     */
    const gauge: Gauge<any>;
}
