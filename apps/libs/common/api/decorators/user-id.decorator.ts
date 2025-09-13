import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract user ID from the JWT token
 * Usage: @UserId() userId: string
 */
export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Check if user exists in request (added by JwtAuthGuard)
    if (!request.user) {
        return undefined;
    }

    return request.user.id;
});

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Check if user exists in request (added by JwtAuthGuard)
    if (!request.user) {
        return undefined;
    }

    return request.user;
});
