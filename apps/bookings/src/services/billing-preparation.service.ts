import { Injectable, Inject } from '@nestjs/common';
import { IBillingsRepository } from 'apps/libs/repositories/billings/billings-repository.interface';
import { BillingPlan } from 'apps/libs/entities/billings/billing-plan.entity';
import { BookingBilling } from 'apps/libs/entities/bookings/booking.entity';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { getUTCDate, getYearAndMonth } from 'apps/libs/common/utils/date';
import { InvoiceStatus } from 'apps/libs/common/enums/invoice-status.enum';
import { PlanCommissionType } from 'apps/libs/common/enums/plan-commission-type.enum';
import { Invoice } from 'apps/libs/entities/billings/invoice.entity';
import { calculateAdjustment } from 'apps/libs/common/utils/billings';
import { roundToHalfUp } from 'apps/libs/common/utils/amounts';

import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';

@Injectable()
export class BillingPreparationService {
    constructor(
        @Inject('BillingsRepository')
        private readonly billingsRepository: IBillingsRepository,
    ) {}

    async prepareBilling(
        hostId: string,
        billingPlan: BillingPlan,
        bookingTotal: number,
        paymentStrategy: IPaymentStrategy,
    ): Promise<BookingBilling | null> {
        let invoice = await this.prepareInvoice(hostId);
        const breakdown = this.calculateBreakdown(billingPlan, bookingTotal);
        const subtotal = this.calculateSubtotal(breakdown);

        return {
            subtotal,
            breakdown,
            invoiceId: invoice.recordId,
            commissionPayer: billingPlan.commissionPayer,
            commissionPaid: paymentStrategy.isCommissionPaid(),
        };
    }

    // prepare invoice: if there are no invoices in progress, create a new one
    async prepareInvoice(hostId: string): Promise<Invoice> {
        let invoices = await this.billingsRepository.getHostInvoices(hostId, [InvoiceStatus.IN_PROGRESS]);
        let currentInvoice = invoices[0] || null;

        if (!currentInvoice) {
            // calculate subtotal as the sum of the billing subtotals from the fetched bookings
            const { year, month } = getYearAndMonth();
            const lastDayOfMonth = new Date(Date.UTC(+year, +month, 0, 23, 59, 59, 999));
            const currentDate = getUTCDate().toISOString();
            const closingBillingDate = lastDayOfMonth.toISOString();

            const recordId = `${year}${month}${generateId()}`;
            currentInvoice = {
                hostId,
                recordId: recordId,
                invoiceNumber: recordId,
                createdAt: getUTCDate().toISOString(),
                breakdown: [],
                subtotal: 0,
                billingTotal: 0,
                total: 0,
                paidCommissions: 0,
                status: InvoiceStatus.IN_PROGRESS,
                startBillingDate: currentDate,
                closingBillingDate,
                delayed: false,
            };
            await this.billingsRepository.createInvoice(currentInvoice);
        }

        return currentInvoice;
    }

    private calculateBreakdown(billingPlan: BillingPlan, bookingTotal: number) {
        return (
            billingPlan?.breakdown
                ?.filter(
                    (item) =>
                        item.key === PlanCommissionType.PLAN_PERCENTAGE_COMMISSION ||
                        (bookingTotal > 0 && item.key == PlanCommissionType.PLAN_FIXED_COMMISSION),
                )
                ?.map((item) => ({
                    key: item.key,
                    type: item.type,
                    amount: item.amount,
                    calculatedAmount: calculateAdjustment(item, bookingTotal),
                })) || []
        );
    }

    private calculateSubtotal(breakdown: Array<{ calculatedAmount: number }>): number {
        const subtotal = breakdown.reduce((sum, item) => sum + item.calculatedAmount, 0);
        return roundToHalfUp(subtotal);
    }
}
