import { Injectable } from '@nestjs/common';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { SessionBookingStrategy } from '../strategies/products/session-booking.strategy';
import { DigitalProductBookingStrategy } from '../strategies/products/digital-product-booking.strategy';
import { EventBookingStrategy } from '../strategies/products/event-booking.strategy';
import { IBookingStrategy } from '../interfaces/booking-strategy.interface';

/**
 * Factory for creating appropriate booking strategies based on product type
 */
@Injectable()
export class BookingStrategyFactory {
    constructor(
        private readonly eventBookingStrategy: EventBookingStrategy,
        private readonly sessionBookingStrategy: SessionBookingStrategy,
        private readonly digitalProductBookingStrategy: DigitalProductBookingStrategy,
    ) {}

    /**
     * Creates the appropriate booking strategy for the given product type
     */
    createStrategy(productType: ProductType): IBookingStrategy {
        switch (productType) {
            case ProductType.EVENT:
                return this.eventBookingStrategy;

            case ProductType.ONE_TO_ONE_SESSION:
                return this.sessionBookingStrategy;

            case ProductType.DIGITAL_PRODUCT:
                return this.digitalProductBookingStrategy;

            case ProductType.DIGITAL_COURSE:
                return this.digitalProductBookingStrategy;

            default:
                return this.eventBookingStrategy;
        }
    }

    /**
     * Gets all available strategies (useful for testing or configuration)
     */
    getAllStrategies(): Record<ProductType, IBookingStrategy> {
        return {
            [ProductType.EVENT]: this.eventBookingStrategy,
            [ProductType.ONE_TO_ONE_SESSION]: this.sessionBookingStrategy,
            [ProductType.DIGITAL_PRODUCT]: this.digitalProductBookingStrategy,
            [ProductType.DIGITAL_COURSE]: this.digitalProductBookingStrategy,
        };
    }
}
