import { Context } from './store/Context';
import { Store } from './store/Store';

declare global {
    var _storeInstance: Store;
    var _contextInstance: Context;

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
