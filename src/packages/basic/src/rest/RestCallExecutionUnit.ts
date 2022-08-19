import { DataContent, DataContentHelper, ExecutionUnit, ObjectContent, TextContent, Timer, UrlLoader } from '@boart/core';
import { PDFContent, RowTypeValue, StepReport } from '@boart/core-impl';
import { RestHttp } from '@boart/execution';

import { RestCallContext } from './RestCallContext';

/**
 *
 */
export class RestCallExecutionUnit implements ExecutionUnit<RestCallContext, RowTypeValue<RestCallContext>> {
    public description = 'rest call - main';
    private readonly restCallReportType = 'Rest call';

    /**
     *
     */
    private parseJSON(data: DataContent | string, type: string): Record<string, string> {
        if (!data || DataContentHelper.isNullOrUndefined(data)) {
            return {};
        }

        try {
            return JSON.parse(data.toString());
        } catch (error) {
            throw Error(`${type} cannot be parsed as a valid json\n${data.toString()}`);
        }
    }

    /**
     *
     */
    private call(rest: RestHttp, context: RestCallContext): Promise<Response> {
        const preContext = context.preExecution;
        const authentication = preContext.authentication?.toString();
        const header = this.parseJSON(preContext.header, 'header');

        switch (preContext.method) {
            case 'get':
                return rest.get(authentication, header);
            case 'post':
                return rest.post(preContext.payload, authentication, header);
            case 'delete':
                return rest.delete(authentication, header);
            case 'put':
                return rest.put(preContext.payload, authentication, header);
            case 'form-data': {
                const payload = Object.assign(preContext.formData.getValue(), this.parseJSON(preContext.payload, 'payload'));
                StepReport.instance.getInputItems(this.restCallReportType).addData('formData', payload);
                return rest.form_data(payload, authentication, header);
            }
            case 'post-param': {
                const payload = Object.assign(preContext.param.getValue(), this.parseJSON(preContext.payload, 'payload'));
                StepReport.instance.getInputItems(this.restCallReportType).addData('postParam', payload);
                return rest.post_param(payload, authentication, header);
            }
        }
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: RestCallContext, _row: RowTypeValue<RestCallContext>): Promise<void> {
        this.inputReport(context);

        //#region rest call executing
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
        //#endregion

        //#region setting result to context
        context.execution.header.asDataContentObject().set('statusText', response.statusText);
        context.execution.header.asDataContentObject().set('status', response.status);
        context.execution.header.asDataContentObject().set('headers', Object.fromEntries(response.headers));

        const contentType = response.headers.get('content-type');
        context.execution.data =
            contentType === 'application/pdf'
                ? await new PDFContent().setBufferAsync(await response.arrayBuffer())
                : new TextContent(await response.text());
        //#endregion

        this.resultReport(context, response);
    }

    /**
     *
     */
    private inputReport(context: RestCallContext) {
        StepReport.instance.type = 'restCall';
        const restCallInpurReport = StepReport.instance.getInputItems(this.restCallReportType);
        restCallInpurReport.addData('query', context.preExecution.query);
        restCallInpurReport.addData('payload', context.preExecution.payload);
    }

    /**
     *
     */
    private resultReport(context: RestCallContext, response: Response) {
        const restCallResultReport = StepReport.instance.getResultItems('Rest call result');
        restCallResultReport.addData('result', {
            status: response.status,
            response: context.execution.data.getText(),
            headers: Object.fromEntries(response.headers)
        });
    }
}
