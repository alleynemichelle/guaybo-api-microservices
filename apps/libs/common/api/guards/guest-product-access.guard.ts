import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GuestAccessService } from '../services/guest-access.service';
import { GuardExceptionFactory } from '../factories/guard-exception.factory';

/**
 * Guard to validate if a guest has access to a product based on their bookings
 * This guard should be used on guest-specific endpoints that provide access to product details or resources
 */
@Injectable()
export class GuestProductAccessGuard implements CanActivate {
    constructor(private readonly guestAccessService: GuestAccessService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id; // JWT token should have the user ID in the sub field
        const productId = request.params.productId;
        const hostId = request.params.hostId;

        // If no user ID or product ID is provided, deny access
        if (!userId || !productId) {
            throw GuardExceptionFactory.createMissingParameters();
        }

        try {
            if (this.guestAccessService.validateOwnerAccess(request.user, hostId)) {
                return true;
            }
            // Check if the user has any bookings for this product
            await this.guestAccessService.getMostRecentBooking(userId, productId);

            return true;
        } catch (error) {
            throw error;
        }
    }
}
