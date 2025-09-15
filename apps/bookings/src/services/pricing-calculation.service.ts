import { Injectable } from '@nestjs/common';
import { DiscountsService } from 'apps/shared/discounts/services/discounts.service';
import { BaseProduct } from 'apps/libs/entities/products/product.entity';
import { Discount } from 'apps/libs/entities/bookings/discount.entity';
import { BillingPlan } from 'apps/libs/entities/billings/billing-plan.entity';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { PlanCommissionType } from 'apps/libs/common/enums/plan-commission-type.enum';
import { calculateAdjustment } from 'apps/libs/common/utils/billings';
import { roundToHalfUp } from 'apps/libs/common/utils/amounts';
import { DiscountScope } from 'apps/shared/discounts/dto/discount.dto';

/**
 * Service for handling pricing calculations
 */
@Injectable()
export class PricingCalculationService {
    constructor(private readonly discountsService: DiscountsService) {}

    /**
     * Calculates items pricing with discounts applied
     */
    calculateItemsAndDiscounts(
        items: any,
        product: BaseProduct,
        planId: string,
        currency: string | undefined,
        couponDiscount: Discount | null | undefined,
    ): {
        bookingItems: any;
        subtotal: number;
        discounts: Discount[];
        finalAmount: number;
        discountedAmount: number;
    } {
        const itemDiscounts = (product.discounts || []).filter((discount) => discount.scope === DiscountScope.ITEM);
        const totalDiscounts = (product.discounts || []).filter((discount) => discount.scope === DiscountScope.TOTAL);
        const plan = product.plans?.find((plan) => plan.recordId === planId);

        // Add coupon discount to appropriate category
        if (couponDiscount?.scope === DiscountScope.ITEM) itemDiscounts.push(couponDiscount);
        if (couponDiscount?.scope === DiscountScope.TOTAL) totalDiscounts.push(couponDiscount);

        // Calculate items with item-level discounts
        const bookingItems = items.map((item) => {
            const price = plan?.price?.find((price) => price.fareType === item.fareType)?.amount as number;
            const discount = this.discountsService.calculateDiscounts(
                price,
                { ...item, currency, planId },
                itemDiscounts,
            );

            return {
                ...item,
                price,
                discounts: discount.discounts,
                finalPrice: discount.finalAmount,
                totalAmount: roundToHalfUp(discount.finalAmount * item.quantity),
            };
        });

        // Calculate subtotal
        const subtotal = bookingItems.reduce((total, item) => total + item.finalPrice * item.quantity, 0);

        // Apply total-level discounts
        const { discounts, finalAmount } = this.discountsService.calculateDiscounts(
            subtotal,
            { currency, planId },
            totalDiscounts,
        );

        const discountedAmount = (discounts || []).reduce(
            (sum, discount) => sum + (this.calculateAdjustment(discount, subtotal) || 0),
            0,
        );

        return {
            bookingItems,
            subtotal: roundToHalfUp(subtotal),
            discounts,
            finalAmount,
            discountedAmount: roundToHalfUp(discountedAmount),
        };
    }

    private calculateAdjustment(interest: { amount: number; type: any }, amount: number): number {
        if (interest.type === 'FIXED') {
            return interest.amount;
        } else if (interest.type === 'PERCENTAGE') {
            return (amount * interest.amount) / 100;
        }

        return 0;
    }
}
