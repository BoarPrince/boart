/* eslint-disable no-var */
import { EnvLoader } from './common/EnvLoader';
import { TextLanguageHandler } from './common/TextLanguageHandler';
import { UrlLoader } from './common/UrlLoader';
import { DescriptionFileReader } from './description/DescriptionFileReader';
import { DescriptionHandler } from './description/DescriptionHandler';
import { ExpectedOperatorInitializer } from './expected/ExpectedOperatorInitializer';
import { Context } from './store/Context';
import { Store } from './store/Store';

declare global {
    var _storeInstance: Store;
    var _contextInstance: Context;
    var _descriptionHandlerInstance: DescriptionHandler;
    var _envLoaderInstance: EnvLoader;
    var _textLanguageHandlerInstance: TextLanguageHandler;
    var _urlLoaderInstance: UrlLoader;
    var _expectedOperatorInitializer: ExpectedOperatorInitializer;
    var _descriptionFileReaderInstance: DescriptionFileReader;

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
