import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the raw temporal token from the request
 * Must be used with TemporalTokenGuard
 */
export const TemporalToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return [request.temporalTokenRaw, request.temporalToken];
});
