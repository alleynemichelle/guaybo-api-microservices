import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { IBookingsRepository } from 'apps/libs/repositories/bookings/booking-repository.interface';
import { BookingsErrorCodes, ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { IProductsRepository } from 'apps/libs/repositories/products/products-repository.interface';
import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { GuardExceptionFactory } from '../factories/guard-exception.factory';

@Injectable()
export class FreeBookingResourcesAccessGuard implements CanActivate {
    constructor(
        @Inject('BookingsRepository') private readonly bookingsRepository: IBookingsRepository,
        @Inject('ProductsRepository') private readonly productsRepository: IProductsRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const bookingId = request.params.bookingId;

        if (!bookingId) throw GuardExceptionFactory.createMissingParameters();

        try {
            // Validate booking
            const booking = await this.bookingsRepository.getBooking(
                bookingId,
                'hostId, productId, freeAccess, bookingStatus',
            );
            if (!booking || booking.bookingStatus != BookingStatus.RECEIVED)
                throw new NotFoundException(BookingsErrorCodes.BookingNotFound);

            // Validate product
            const product = await this.productsRepository.getProduct(
                booking.hostId,
                booking.productId,
                'recordId, isFree, productType, productStatus',
            );
            if (!product || product.productStatus != ProductStatus.PUBLISHED)
                throw new NotFoundException(ProductsErrorCodes.ProductNotFound);

            if (
                booking.freeAccess == false ||
                ((booking.freeAccess == null || booking.freeAccess == undefined) && !product.isFree)
            )
                throw new ForbiddenException(BookingsErrorCodes.BookingNotFound);

            request.booking = booking;
            return true;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            throw GuardExceptionFactory.createUnauthorizedAccess();
        }
    }
}
