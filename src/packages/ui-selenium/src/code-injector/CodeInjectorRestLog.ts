import { WebDriver } from 'selenium-webdriver';
import { BoartInjectorInstance, LogEntryType } from './BoartInjectorInstance';
import { LogEntry } from './LogEntry';
import { InjectedXMLHttpRequest } from './InjectedXMLHttpRequest';

/**
 *
 */
export class CodeInjectorRestLog {
    /**
     *
     */
    constructor(private driver: WebDriver) {}

    /**
     *
     */
    getCallLevel(): Promise<number> {
        return this.driver.executeScript(() => globalThis.boart.call_level ?? 0);
    }

    /**
     *
     */
    public async inject(): Promise<void> {
        await this.driver.executeScript(() => {
            /**
             * Globals
             */
            let boart: BoartInjectorInstance;
            if (!globalThis.boart?.call_level == null) {
                boart = {
                    call_level: 0,
                    logList: []
                };
                globalThis.boart = boart;
            } else {
                return;
            }

            /**
             * Trace Rest Calls: Open
             */
            // eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
            const origRestOpen = window.XMLHttpRequest.prototype.open;
            window.XMLHttpRequest.prototype.open = function (method: string, url: string) {
                const logEntry: LogEntry = {
                    url: url.startsWith('/') ? location.origin : url,
                    id: undefined,
                    method: method,
                    startTime: undefined,
                    endTime: undefined,
                    status: undefined,
                    duration: undefined,
                    path: undefined,
                    traceId: undefined,
                    requestBody: undefined,
                    response: undefined,
                    responseType: undefined,
                    headers: []
                };
                const request = this as InjectedXMLHttpRequest;
                request.logEntry = logEntry;

                const startTime = window.performance.now();
                boart.call_level++;

                request.addEventListener('loadstart', () => {
                    logEntry.startTime = Date.now();
                    logEntry.id = Math.floor(Math.random() * 100) + ':' + logEntry.startTime;
                    logEntry.path = document.location.pathname;

                    boart.logList.push({ type: LogEntryType.Start, entry: JSON.stringify(logEntry) });
                });

                request.addEventListener('loadend', () => {
                    delete logEntry.headers;
                    delete logEntry.requestBody;
                    logEntry.endTime = Date.now();

                    boart.logList.push({ type: LogEntryType.End, entry: JSON.stringify(logEntry) });
                });

                request.addEventListener('load', () => {
                    boart.call_level--;
                    logEntry.status = request.status;
                    logEntry.traceId = request.getResponseHeader('trace-id');
                    const responseType = request.responseType;
                    if (responseType !== 'blob') {
                        try {
                            logEntry.response = JSON.parse(request.responseText) as object;
                        } catch (error) {
                            logEntry.response = request.responseText;
                        }
                    }

                    logEntry.responseType = responseType;
                    logEntry.duration = (window.performance.now() - startTime).toFixed(2);
                });
                origRestOpen.apply(this, [method, url]);
            };

            /**
             * Trace Rest Calls: SetRequestHeader
             */
            // eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
            const origSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
            window.XMLHttpRequest.prototype.setRequestHeader = function (name: string, value: string) {
                const request = this as InjectedXMLHttpRequest;
                request.logEntry.headers.push(`'${name}' : '${value}'`);
                origSetRequestHeader.apply(this, [name, value]);
            };

            /**
             * Trace Rest Calls: Send
             */
            // eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
            const origSend = window.XMLHttpRequest.prototype.send;
            window.XMLHttpRequest.prototype.send = function (body) {
                const request = this as InjectedXMLHttpRequest;
                try {
                    request.logEntry.requestBody = JSON.parse(<string>body) as object;
                } catch (error) {
                    request.logEntry.requestBody = body;
                }
                origSend.apply(this, [body]);
            };
        });
    }
}
