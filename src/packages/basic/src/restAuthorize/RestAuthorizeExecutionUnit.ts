import { ExecutionUnit, ObjectContent, TextContent, Timer, UrlLoader } from '@boart/core';
import { RowTypeValue } from '@boart/core-impl';
import { RestHttp } from '@boart/execution';
import { StepReport } from '@boart/protocol';
import { firstValueFrom, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
        const rest = new RestHttp(UrlLoader.instance.getAbsoluteUrl(context.config.url));

        StepReport.instance.type = 'restAuthorize';

        StepReport.instance.addInputItem('Rest authorize (config)', 'json', {
            config: context.config,
            url: rest.getCurl()
        });

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
                context.execution.header = new ObjectContent({
                    retries,
                    duration: timer.stop().duration,
                    trace: rest.getExecutionInfo(),
                    decoded: token.decoded
                });

                break;
            } catch (error) {
                if (retries === 0) {
                    throw error;
                }

                await firstValueFrom(of().pipe(delay(context.config.retryPause)));
            }
        }

        StepReport.instance.addResultItem('Rest authorize (token)', 'json', context.execution.data);
        StepReport.instance.addResultItem('Rest authorize (header)', 'json', context.execution.header);
    }
}
