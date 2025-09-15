import { Injectable } from '@nestjs/common';
import { BookingPreview } from 'apps/libs/domain/bookings/booking-preview.entity';
import { InstallmentsProgram } from 'apps/libs/domain/bookings/installments-program.entity';
import { Discount } from 'apps/libs/domain/bookings/discount.entity';
import { BillingPlan } from 'apps/libs/domain/billings/billing-plan.entity';
import { AppFeeCalculationService } from '../services/app-fee-calculation.service';
import { InstallmentCalculationService } from '../services/installment-calculation.service';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { roundToHalfUp } from 'apps/libs/common/utils/amounts';

interface BookingItem {
    discounts: Array<Discount>;
    fareType: string;
    finalPrice: number;
    price: number;
    quantity: number;
    totalAmount: number;
}

interface ExchangeRate {
    official: {
        average: number;
    };
    currency: string;
    date: string;
}

/**
 * Builder for creating BookingPreview objects with complex calculations
 */
@Injectable()
export class BookingPreviewBuilder {
    private preview: Partial<BookingPreview>;

    constructor(
        private readonly appFeeCalculationService: AppFeeCalculationService,
        private readonly installmentCalculationService: InstallmentCalculationService,
    ) {
        this.reset();
    }

    /**
     * Resets the builder for new preview creation
     */
    public reset(): BookingPreviewBuilder {
        this.preview = {};
        return this;
    }

    /**
     * Sets basic pricing information
     */
    public withBasicPricing(subtotal: number, discountedAmount: number): BookingPreviewBuilder {
        this.preview.subtotal = subtotal;
        this.preview.discountedAmount = discountedAmount;
        return this;
    }

    /**
     * Sets items and discounts
     */
    public withItemsAndDiscounts(items: BookingItem[], discounts: Discount[]): BookingPreviewBuilder {
        this.preview.items = items;
        this.preview.discounts = discounts;
        return this;
    }

    /**
     * Sets conversion rates
     */
    public withConversionRates(exchangeRate?: ExchangeRate): BookingPreviewBuilder {
        if (exchangeRate) {
            this.preview.conversionRates = [
                {
                    amount: exchangeRate.official.average,
                    currency: exchangeRate.currency,
                    updatedAt: exchangeRate.date,
                },
            ];
        }
        return this;
    }

    /**
     * Calculates and sets the final total
     */
    public calculateInstallmentsAndTotal(params: {
        billingPlan: BillingPlan;
        installmentsProgram?: InstallmentsProgram;
        subtotal: number;
        currency: string;
        conditions: Record<string, any>;
    }): BookingPreviewBuilder {
        // Calculate initial total without app fee
        let total = (this.preview.subtotal || 0) - (this.preview.discountedAmount || 0);

        // Calculate and add app fee
        const appFee = this.appFeeCalculationService.calculateAppFee(params.billingPlan, total);
        this.preview.appFee = appFee;

        if (appFee.commissionPayer === CommissionPayer.CUSTOMER) {
            this.preview.finalAmountBeforeAppFee = total;
            total += appFee.amount;
        }

        // Calculate installments if program exists
        if (params.installmentsProgram) {
            const installmentsData = this.installmentCalculationService.calculateInstallmentsData(
                params.subtotal,
                total,
                params.installmentsProgram,
                params.conditions,
            );

            // Update preview with installments data
            this.preview.installments = installmentsData.installments;
            this.preview.installmentsInterestFee = installmentsData.installmentsInterestFee;
            this.preview.installmentsProgramApplied = installmentsData.installmentsProgramApplied;
            this.preview.remainingAmount = installmentsData.remainingAmount;

            // Update total with interest fee
            total = installmentsData.finalAmountWithInterest;
        }

        this.preview.total = roundToHalfUp(total);
        this.preview.amountToPay =
            this.preview.installments && this.preview.installments.length > 0
                ? this.preview.installments[0].amount
                : roundToHalfUp(total);
        return this;
    }

    /**
     * Builds the final BookingPreview object
     */
    public build(): BookingPreview {
        const result = this.preview as BookingPreview;
        this.reset();
        return result;
    }
}
