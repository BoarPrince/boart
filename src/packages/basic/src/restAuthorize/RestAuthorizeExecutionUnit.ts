import { ExecutionUnit, ObjectContent, TextContent, Timer, UrlLoader } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { RestHttp } from '@boart/execution';
import { StepReport } from '@boart/protocol';

import { RestAuthorizeContext } from './RestAuthorizeContext';

/**
 *
 */
export class RestAuthorizeExecutionUnit implements ExecutionUnit<RestAuthorizeContext, RowTypeValue<RestAuthorizeContext>> {
    public description = 'rest call - main';

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(context: RestAuthorizeContext, _row: RowTypeValue<RestAuthorizeContext>): Promise<void> {
        const timer = new Timer();
        const url = UrlLoader.instance.getAbsoluteUrl(context.config.url);
        const rest = new RestHttp(url);

        StepReport.instance.type = 'restAuthorize';
        StepReport.instance.addInputItem('Rest authorize (config)', 'json', context.config);

        let retries = context.config.retryCount;
        while (retries--) {
            try {
                const token = await rest.bearer(
                    context.config.grantType,
                    context.config.clientId,
                    context.config.clientSecret,
                    context.config.scope,
                    context.config.username,
                    context.config.password
                );
                context.execution.data = new TextContent(token.accessToken);
                context.execution.tokenDecoded = token.decoded;
                const header = {
                    retries,
                    duration: timer.stop().duration,
                    decoded: token.decoded
                };
                context.execution.header = new ObjectContent(Object.assign(header, rest.getExecutionInfo()));

                break;
            } catch (error) {
                if (retries === 0) {
                    throw error;
                }
                await new Promise<void>((resolve) => setTimeout(() => resolve(), context.config.retryPause));
            }
        }

        StepReport.instance.addResultItem('Rest authorize (token)', 'json', context.execution.data);
        StepReport.instance.addResultItem('Rest authorize (decoded)', 'json', context.execution.tokenDecoded);
        StepReport.instance.addResultItem('Rest authorize (header)', 'json', context.execution.header);
    }
}
