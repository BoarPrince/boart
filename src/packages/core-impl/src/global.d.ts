import 'jest-extended';
import { TemplateHandler } from './value/TemplateHandler';

export declare global {
    /**
     *
     */
    interface Console {
        readonly message: (...args: readonly unknown[]) => void;
    }

    var _templateHandlerInstance: TemplateHandler;
}
