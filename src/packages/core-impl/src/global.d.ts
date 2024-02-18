/* eslint-disable no-var */
import 'jest-extended';
import { TemplateHandler } from './value/TemplateHandler';

export declare global {
    var _templateHandlerInstance: TemplateHandler;
    var _coreImplInitialized: boolean;

    /**
     *
     */
    interface Console {
        readonly message: (...args: readonly unknown[]) => void;
    }
}
