import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GuestAccessService } from '../services/guest-access.service';
import { GuardExceptionFactory } from '../factories/guard-exception.factory';

/**
 * This guard should be used on guest-specific endpoints that provide access to product resources
 * It checks if the user has access to the product resources based on their bookings
 * If the user's booking is confirmed, they have access to the resources
 * If the first installment payment is confirmed, they have access to the resources
 * If the user is the owner of the product, they have access to the resources
 */
@Injectable()
export class GuestResourcesAccessGuard implements CanActivate {
    constructor(private readonly guestAccessService: GuestAccessService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const productId = request.params.productId;
        const hostId = request.params.hostId;

        // If no user ID or product ID is provided, deny access
        if (!userId || !productId) throw GuardExceptionFactory.createMissingParameters();

        try {
            // If the user is the owner (host), grant access
            if (this.guestAccessService.validateOwnerAccess(request.user, hostId)) return true;

            // Get the most recent booking for the user and product
            const booking = await this.guestAccessService.getMostRecentBooking(userId, productId);

            // Validate that the product exists and is not deleted
            await this.guestAccessService.validateProduct(hostId, productId);

            // Check if the product has resources
            const hasResources = await this.guestAccessService.checkProductHasResources(hostId, productId);
            if (!hasResources) {
                return true;
            }

            // If the product has resources, check if the user has access to the resources
            const hasAccess = this.guestAccessService.validatePaymentAccess(booking);
            if (!hasAccess) {
                throw GuardExceptionFactory.createNoProductAccess();
            }

            // Add booking information to request for potential use in controllers
            request.bookingDetails = booking;
            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }

            // If there's an unexpected error, deny access
            throw GuardExceptionFactory.createUnauthorizedAccess();
        }
    }
}
