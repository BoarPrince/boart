import 'jest-extended';

declare global {
    /**
     *
     */
    interface Console {
        readonly message: (...args: readonly unknown[]) => void;
    }
}
