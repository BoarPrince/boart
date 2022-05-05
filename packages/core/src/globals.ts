import 'jest-extended';
import { ContentType } from './data/ContentType';
import { StoreMap } from './store/StoreMap';

// an import is required, or else the global keyword does not work
declare global {
    /**
     *
     */
    const beforeSuite: (runnable: () => void) => void;
    const step: (name: string, runnable: (...parameters: readonly object[]) => void) => void;

    /**
     *
     */
    interface Window {
        readonly TEST_OBJECT: object;
        readonly uiHelper: object;
        readonly getAllAngularTestabilities: () => unknown;
    }

    /**
     *
     */
    type LogProxy = (type: any, subType?: any, origLogger?: any) => any;

    /**
     *
     */
    interface Console {
        readonly restLogStart: LogProxy;
        readonly restLogEnd: LogProxy;
        readonly redirectStart: LogProxy;
        readonly redirectEnd: LogProxy;
        readonly message: (...args: readonly unknown[]) => void;
    }

    /**
     *
     */
    interface Gauge<T> {
        readonly dataStore: {
            readonly suiteStore: StoreMap;
            readonly specStore: StoreMap;
            readonly scenarioStore: StoreMap;
        };
        context: {
            step_report_helper: any;
            test_report_helper: any;
            scenario_report_helper: any;
        };
        readonly message: (text: string) => void;
    }

    /**
     *
     */
    const gauge: Gauge<any>;
}
