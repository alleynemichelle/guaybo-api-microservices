import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract user data from the JWT token
 * Usage: @CurrentUser() user: UserData or @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Check if user exists in request (added by JwtAuthGuard)
    if (!request.user) {
        return null;
    }

    // If a specific property is requested, return only that property
    if (data) {
        return request.user[data];
    }

    // Otherwise return the entire user object
    return request.user;
});

/**
 * Interface for user data extracted from JWT
 */
export interface UserData {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    sub?: string;
    [key: string]: any;
}
