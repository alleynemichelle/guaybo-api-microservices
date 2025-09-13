import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export interface UserPropertyOptions {
    required?: boolean;
    defaultValue?: any;
}

/**
 * Decorator to extract a specific property from user data in JWT token
 * @param propertyPath - Dot notation path to the property (e.g., 'profile.address.city')
 * @param options - Additional options for property extraction
 *
 * Usage:
 * @UserProperty('email') email: string
 * @UserProperty('roles') roles: string[]
 * @UserProperty('profile.address.city') city: string
 */
export const UserProperty = createParamDecorator((propertyPath: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Check if user exists in request
    if (!request.user) {
        return undefined;
    }

    // Handle simple property access
    if (!propertyPath || !propertyPath.includes('.')) {
        return request.user[propertyPath];
    }

    // Handle nested property access using dot notation
    const pathParts = propertyPath.split('.');
    let value = request.user;

    for (const part of pathParts) {
        if (value === null || value === undefined) {
            return undefined;
        }
        value = value[part];
    }

    return value;
});
