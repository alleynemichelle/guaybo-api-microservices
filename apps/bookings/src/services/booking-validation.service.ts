import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseProduct, ProductDate, ProductPlan } from 'apps/libs/domain/products/product.entity';
import { Discount } from 'apps/libs/domain/bookings/discount.entity';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { BookingsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { BookingsRepository } from 'apps/libs/database/drizzle/repositories/bookings.repository';

/**
 * Service for handling booking validations
 */
@Injectable()
export class BookingValidationService {
    constructor(private readonly bookingsRepository: BookingsRepository) {}

    /**
     * Validates a booking preview request
     */
    async validateBookingPreview(
        product: BaseProduct,
        planId: string,
        dateId: string | undefined,
        currency: string | undefined,
        coupon: string | undefined,
        discountCode: Discount | null | undefined,
    ): Promise<void> {
        this.validateProductStatus(product);
        this.validatePlan(product, planId);
        this.validateCurrency(product, currency);
        this.validateDiscountCode(coupon, discountCode);
        await this.validateMaxCapacity(product, planId, dateId, discountCode);
    }

    /**
     * Validates product status
     */
    private validateProductStatus(product: BaseProduct): void {
        // Product should be published and not deleted
        if (product.productStatus === ProductStatus.DRAFT || product.productStatus === ProductStatus.PAUSED) {
            throw new BadRequestException(BookingsErrorCodes.ProductIsNotPublished);
        }

        if (!product || product.recordStatus === Status.DELETED || product.productStatus !== ProductStatus.PUBLISHED) {
            throw new BadRequestException(BookingsErrorCodes.ProductNotFound);
        }
    }

    /**
     * Validates that the plan exists
     */
    private validatePlan(product: BaseProduct, planId: string): void {
        const plan = product.plans?.find((plan) => plan.recordId === planId);
        if (!plan) {
            throw new BadRequestException(BookingsErrorCodes.PlanNotFound);
        }
    }

    /**
     * Validates currency support
     */
    private validateCurrency(product: BaseProduct, currency: string | undefined): void {
        if (!product.isFree && currency && !product.bookingSettings?.currencies.includes(currency)) {
            throw new BadRequestException(BookingsErrorCodes.InvalidCurrency);
        }
    }

    /**
     * Validates discount code existence
     */
    private validateDiscountCode(coupon: string | undefined, discountCode: Discount | null | undefined): void {
        if (coupon && !discountCode) {
            throw new BadRequestException(BookingsErrorCodes.DiscountCodeNotFound);
        }
    }

    /**
     * Validates maximum capacity constraints
     */
    private async validateMaxCapacity(
        product: BaseProduct,
        planId: string,
        dateId: string | undefined,
        discount: Discount | undefined | null,
    ): Promise<void> {
        const startTime = performance.now();
        const bookings = await this.bookingsRepository.getProductBookings(product.hostId, product.recordId);

        const plan = product.plans?.find((plan) => plan.recordId === planId);
        const date = product.dates?.find((date) => date.recordId === dateId);

        // Validate product max bookings
        this.validateProductMaxCapacity(product, bookings.length);

        // Validate plan max bookings
        this.validatePlanMaxCapacity(plan, bookings, planId);

        // Validate date max bookings
        this.validateDateMaxCapacity(date, bookings, dateId);

        // Validate discount max bookings
        this.validateDiscountMaxCapacity(discount, bookings);
    }

    private validateProductMaxCapacity(product: BaseProduct, bookingCount: number): void {
        if (product.maxCapacity && product.maxCapacity > 0) {
            if (bookingCount >= product.maxCapacity) {
                throw new BadRequestException(BookingsErrorCodes.ProductMaxBookingsReached);
            }
        }
    }

    private validatePlanMaxCapacity(plan: ProductPlan | undefined, bookings: any[], planId: string): void {
        if (plan?.maxCapacity && plan.maxCapacity > 0) {
            const bookingsByPlan = bookings.filter((booking) => booking.planId === planId);
            if (bookingsByPlan.length >= plan.maxCapacity) {
                throw new BadRequestException(BookingsErrorCodes.PlanMaxBookingsReached);
            }
        }
    }

    private validateDateMaxCapacity(date: ProductDate | undefined, bookings: any[], dateId: string | undefined): void {
        if (date?.maxCapacity && date.maxCapacity > 0 && dateId) {
            const bookingsByDate = bookings.filter((booking) => booking.dateId === dateId);
            if (bookingsByDate.length >= date.maxCapacity) {
                throw new BadRequestException(BookingsErrorCodes.DateMaxBookingsReached);
            }
        }
    }

    private validateDiscountMaxCapacity(discount: Discount | undefined | null, bookings: any[]): void {
        if (discount && discount.maxCapacity && discount.maxCapacity > 0) {
            console.log('discount.maxCapacity', discount.maxCapacity);
            const bookingsByDiscount = bookings.filter((booking) =>
                booking.bookingPreview?.discounts?.some((d) => d.recordId === discount.recordId),
            );

            if (bookingsByDiscount.length >= discount.maxCapacity) {
                throw new BadRequestException(BookingsErrorCodes.DiscountCodeMaxBookingsReached);
            }
        }
    }
}
