import path from 'path';
import { Injectable } from '@nestjs/common';

import { Payment } from 'apps/libs/entities/bookings/payment.entity';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { Booking } from 'apps/libs/entities/bookings/booking.entity';

import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreateInstallmentPaymentDto } from '../../presentation/dto/create-installment-payment.dto';

/**
 * Builder for creating installment payment entities
 */
@Injectable()
export class InstallmentPaymentBuilder {
    private payment: Partial<Payment> = {};

    constructor() {
        this.reset();
    }

    reset(): InstallmentPaymentBuilder {
        const date = getUTCDate();
        const paymentId = `${date.getTime()}${generateId()}`;

        this.payment = {
            recordId: paymentId,
            createdAt: date.toISOString(),
            paymentDate: date.toISOString(),
            paymentStatus: PaymentStatus.PENDING,
            requiresCoordination: false,
        };
        return this;
    }

    withBookingData(booking: Booking): InstallmentPaymentBuilder {
        this.payment = {
            ...this.payment,
            bookingId: booking.recordId,
            hostId: booking.hostId,
            productId: booking.productId,
            planId: booking.planId,
            customerId: booking.customerId,
            userId: booking.userId,
        };
        return this;
    }

    withPaymentData(paymentDto: CreateInstallmentPaymentDto): InstallmentPaymentBuilder {
        const date = getUTCDate();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        const { filename } = this.extractFilenameFromReceipt(paymentDto.paymentReceipt);

        this.payment = {
            ...this.payment,
            amount: paymentDto.total,
            paymentMethodId: paymentDto.paymentMethodId,
            paymentReceipt: paymentDto.paymentReceipt
                ? `private/products/${this.payment.productId}/payments/${yyyy}-${mm}-${dd}/${filename}.jpeg`
                : undefined,
            referenceCode: paymentDto.referenceCode,
            installments: paymentDto.installments,
            recordType: DatabaseKeys.PAYMENT,
        };
        return this;
    }

    withPaymentMethod(paymentStrategy: IPaymentStrategy): InstallmentPaymentBuilder {
        this.payment = {
            ...this.payment,
            paymentMethod: paymentStrategy.getPaymentMethod(),
            currency: paymentStrategy.getCurrency(),
            requiresCoordination: paymentStrategy.requiresCoordination(),
        };
        return this;
    }

    withConversionRate(conversionRate: any): InstallmentPaymentBuilder {
        if (conversionRate) {
            this.payment.conversionRates = [
                {
                    amount: conversionRate.official.average,
                    currency: conversionRate.currency,
                    updatedAt: conversionRate.date,
                },
            ];
        }
        return this;
    }

    withPaymentStatus(paymentStrategy: IPaymentStrategy): InstallmentPaymentBuilder {
        this.payment = {
            ...this.payment,
            paymentStatus: paymentStrategy.getPaymentStatus(),
        };
        return this;
    }

    build(): Payment {
        return this.payment as Payment;
    }

    private extractFilenameFromReceipt(paymentReceipt?: string): { filename: string } {
        return paymentReceipt ? { filename: path.parse(paymentReceipt).name } : { filename: '' };
    }
}
