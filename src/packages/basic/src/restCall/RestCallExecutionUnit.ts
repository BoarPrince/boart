import { DataContentHelper, DefaultRowType, ExecutionUnit, ObjectContent, TextContent, Timer, UrlLoader } from '@boart/core';
import { PDFContent } from '@boart/core-impl';
import { RestHttp } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RestCallContext } from './RestCallContext';

/**
 *
 */
export class RestCallExecutionUnit implements ExecutionUnit<RestCallContext, DefaultRowType<RestCallContext>> {
    readonly key = Symbol('rest call - main');
    readonly description = () => ({
        id: '8db1cbdc-8c32-4487-a3a8-0fe7777cd1d8',
        description: '',
        examples: null
    });

    /**
     *
     */
    private static isJSON(data: string): boolean {
        try {
            JSON.parse(data);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     *
     */
    private parseJSON(data: object | string, type: string): Record<string, string> {
        if (!data || DataContentHelper.isNullOrUndefined(data)) {
            return {};
        }

        try {
            if (DataContentHelper.isContent(data)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-base-to-string
                return JSON.parse(data.toString());
            } else if (typeof data === 'string') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return JSON.parse(data);
            } else {
                return data as Record<string, string>;
            }
        } catch (error) {
            throw Error(`${type} cannot be parsed as a valid json\n${data.toString()}`);
        }
    }

    /**
     *
     */
    private call(rest: RestHttp, context: RestCallContext): Promise<Response> {
        const preContext = context.preExecution;
        const authorization = preContext.authorization?.toString();
        const header = this.parseJSON(preContext.header, 'header');

        switch (preContext.method.type) {
            case 'get':
                return rest.get(authorization, header);
            case 'post':
                return rest.post(preContext.payload, authorization, header);
            case 'delete':
                return rest.delete(authorization, header);
            case 'put':
                return rest.put(preContext.payload, authorization, header);
            case 'patch':
                return rest.patch(preContext.payload, authorization, header);
            case 'form-data': {
                const payload = Object.assign(preContext.formData.getValue(), this.parseJSON(preContext.payload, 'payload'));
                return rest.form_data(payload, authorization, header);
            }
            case 'post-param': {
                const payload = Object.assign({}, preContext.param.getValue(), this.parseJSON(preContext.payload, 'payload'));
                return rest.post_param(payload, authorization, header);
            }
        }
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: RestCallContext, _row: DefaultRowType<RestCallContext>): Promise<void> {
        //#region rest call executing
        const timer = new Timer();
        const query = context.preExecution.query;
        const rest = new RestHttp(UrlLoader.instance.url(context.preExecution.method.url) + (query ? `?${query.toString()}` : ''));

        StepReport.instance.type = 'restCall';

        let response: Response;
        try {
            response = await this.call(rest, context);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            context.execution.data = new TextContent(error.message as string);
            throw error;
        } finally {
            StepReport.instance.addInputItem('Rest call', 'json', rest.getExecutionInfo(false));
            StepReport.instance.addInputItem('Rest call (payload)', 'json', context.preExecution.payload);
            StepReport.instance.addInputItem('Rest call (curl)', 'text', rest.getCurl());

            context.execution.header = new ObjectContent({
                duration: timer.stop().duration
            });
        }
        //#endregion

        //#region setting result to context
        context.execution.header.asDataContentObject().set('statusText', response.statusText);
        context.execution.header.asDataContentObject().set('status', response.status);
        context.execution.header.asDataContentObject().set('headers', Object.fromEntries(response.headers));

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) {
            context.execution.data = await new PDFContent().setBufferAsync(await response.arrayBuffer());
        } else {
            const responseText = await response.text();
            if (RestCallExecutionUnit.isJSON(responseText)) {
                context.execution.data = new ObjectContent(responseText);
            } else {
                context.execution.data = new TextContent(responseText);
            }
        }
        //#endregion

        StepReport.instance.addResultItem('Rest call result (header)', 'json', context.execution.header);
        StepReport.instance.addResultItem('Rest call result (paylaod)', 'json', context.execution.data);
    }
}
