/* eslint-disable no-var */
import { BoartInjectorInstance } from './code-injector/BoartInjectorInstance';

declare global {
    var boart: BoartInjectorInstance;
}
