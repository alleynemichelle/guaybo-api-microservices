import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GuestProductAccessGuard } from '../guards/guest-product-access.guard';

/**
 * Decorator to validate if a guest has access to a product based on their bookings
 * This combines multiple decorators to ensure proper documentation and validation
 */
export function RequireProductAccess() {
    return applyDecorators(
        UseGuards(GuestProductAccessGuard),
        ApiUnauthorizedResponse({ description: 'User does not have access to this product' }),
    );
}
