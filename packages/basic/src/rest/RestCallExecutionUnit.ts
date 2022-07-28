import { ExecutionUnit, ObjectContent, TextContent, Timer, UrlLoader } from '@boart/core';
import { PDFContent, RowTypeValue } from '@boart/core-impl';
import { RestHttp } from '@boart/execution';

import { RestCallContext } from './RestCallContext';

/**
 *
 */
export class RestCallExecutionUnit implements ExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>> {
    description = 'rest call - main';

    /**
     *
     */
    private call(rest: RestHttp, context: RestCallContext): Promise<Response> {
        const preContext = context.preExecution;
        switch (preContext.method) {
            case 'get':
                return rest.get(preContext.authentication, preContext.header);
            case 'post':
                return rest.post(preContext.payload, preContext.authentication, preContext.header);
            case 'delete':
                return rest.delete(preContext.authentication, preContext.header);
            case 'put':
                return rest.put(preContext.payload, preContext.authentication, preContext.header);
            case 'form-data':
                return rest.form_data(preContext.formData, preContext.authentication, preContext.header);
            case 'post-param':
                return rest.post_param(preContext.param, preContext.authentication, preContext.header);
        }
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: RestCallContext, _row: RowTypeValue<RestCallContext>): Promise<void> {
        const timer = new Timer();

        const rest = new RestHttp(UrlLoader.instance.getAbsoluteUrl(context.preExecution.url));
        let response: Response;
        try {
            response = await this.call(rest, context);
        } catch (error) {
            context.execution.data = new TextContent(error.message as string);
            throw error;
        } finally {
            context.execution.header = new ObjectContent({
                duration: timer.stop().duration
            });
        }

        context.execution.header.asDataContentObject().set('statusText', response.statusText);
        context.execution.header.asDataContentObject().set('status', response.status);
        context.execution.header.asDataContentObject().set('headers', Object.fromEntries(response.headers));

        const contentType = response.headers.get('content-type');
        context.execution.data =
            contentType === 'application/pdf'
                ? await new PDFContent().setBufferAsync(await response.arrayBuffer())
                : new TextContent(await response.text());
    }
}
