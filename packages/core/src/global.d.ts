/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest-extended';

declare global {
    /**
     *
     */
    interface Console {
        readonly message: (...args: readonly unknown[]) => void;
    }
}
