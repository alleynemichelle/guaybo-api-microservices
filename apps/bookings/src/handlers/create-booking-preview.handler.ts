import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BookingPreview } from 'apps/libs/domain/bookings/booking-preview.entity';
import { Discount } from 'apps/libs/domain/bookings/discount.entity';

import { BookingsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ExchangeRateService } from 'apps/libs/integrations/exchanges/exchange-rate.service';
import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { Host } from 'apps/libs/domain/hosts/hosts.entity';

import { BookingPreviewBuilder } from '../builders/booking-preview.builder';
import { PricingCalculationService } from '../services/pricing-calculation.service';
import { BookingValidationService } from '../services/booking-validation.service';
import { BookingStrategyFactory } from '../factories/booking-strategy.factory';
import { CreateBookingPreviewDto } from '../observers/requests/create-booking-preview.dto';

/**
 * Handler for creating booking previews
 */
@Injectable()
export class CreateBookingPreviewHandler {
    private readonly exchangeRateSource = this.configService.get('DEFAULT_EXCHANGE_SOURCE') as string;

    constructor(
        private readonly hostsRepository: HostsRepository,
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly productsRepository: ProductsRepository,

        private readonly bookingPreviewBuilder: BookingPreviewBuilder,
        private readonly bookingStrategyFactory: BookingStrategyFactory,
        private readonly pricingCalculationService: PricingCalculationService,
        private readonly bookingValidationService: BookingValidationService,
        private readonly exchangeRateService: ExchangeRateService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Handles the creation of a booking preview
     */
    async handle(
        data: CreateBookingPreviewDto,
        bookingProduct?: BaseProduct,
        bookingHost?: Host,
    ): Promise<{
        bookingPreview: BookingPreview;
        discountCode: Discount | null | undefined;
    }> {
        try {
            // 1. Fetch required data concurrently
            const [host, product, productId, discountCode] = await this.fetchRequiredData(
                data,
                bookingHost,
                bookingProduct,
            );

            // 2. Run common validations
            await this.bookingValidationService.validateBookingPreview(
                product,
                data.planId,
                data.dateId,
                data.currency,
                data.coupon,
                discountCode,
            );

            // 3. Use strategy pattern for product-specific validations
            const bookingStrategy = this.bookingStrategyFactory.createStrategy(product.productType);
            await bookingStrategy.validateBookingAvailability(product, data);

            // 4. Calculate pricing
            const pricing = this.pricingCalculationService.calculateItemsAndDiscounts(
                data.items,
                product,
                data.planId,
                data.currency,
                discountCode,
            );

            // 5. Get exchange rate
            const exchangeRate = await this.exchangeRateService.getRateFromAPI(this.exchangeRateSource);

            // 6. Build the preview using builder pattern with all calculations
            const bookingPreview = this.bookingPreviewBuilder
                .reset()
                .withBasicPricing(pricing.subtotal, pricing.discountedAmount)
                .withItemsAndDiscounts(pricing.bookingItems, pricing.discounts)
                .withConversionRates(exchangeRate)
                .calculateInstallmentsAndTotal({
                    billingPlan: host.billingPlan,
                    installmentsProgram: product.installments,
                    subtotal: pricing.subtotal,
                    currency: data.currency!,
                    conditions: data,
                })
                .build();

            return { bookingPreview, discountCode };
        } catch (error) {
            throw error;
        }
    }

    // private async fetchRequiredData(
    //     data: CreateBookingPreviewDto,
    //     bookingHost?: Host,
    //     bookingProduct?: BaseProduct,
    // ): Promise<[Host, BaseProduct, number, Discount | null | undefined]> {
    //     const [host, product, productBaseData] = await Promise.all([
    //         bookingHost || this.hostsRepository.findByRecordId(data.hostId),
    //         bookingProduct || this.productsDynamoRepository.getProduct(data.hostId, data.productId),
    //         this.productsRepository.findByRecordId(data.productId),
    //     ]);

    //     if (!product || !host) {
    //         throw new BadRequestException(BookingsErrorCodes.ProductNotFound);
    //     }

    //     const discountCode = data.coupon
    //         ? product?.discountCodes?.find((discount) => discount.code === data.coupon)
    //         : null;

    //     return [host, product, productBaseData?.id || 0, discountCode];
    // }

    private async fetchRequiredData(
        data: CreateBookingPreviewDto,
    ): Promise<[Host, BaseProduct, number, Discount | null | undefined]> {
        const [host, product, productBaseData] = await Promise.all([
            this.hostsRepository.findByRecordId(data.hostId),
            this.productsRepository.findByRecordId(data.productId),
            this.plansRepository.findByRecordId(data.productId),
            data.dateId ? this.datesRepository.findByRecordId(data.dateId) : null,
        ]);

        if (!product || !host) {
            throw new BadRequestException(BookingsErrorCodes.ProductNotFound);
        }

        const discountCode = data.coupon
            ? product?.discountCodes?.find((discount) => discount.code === data.coupon)
            : null;

        return [host, product, productBaseData?.id || 0, discountCode];
    }
}
