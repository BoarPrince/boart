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
    interface process {
        env: {
            environment_project_root: string;
            environment_project_location: string;
        };
    }
}
