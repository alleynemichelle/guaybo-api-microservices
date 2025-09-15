import path from 'path';
import { Injectable } from '@nestjs/common';
import { Payment } from 'apps/libs/entities/bookings/payment.entity';
import { Customer } from 'apps/libs/entities/users/customer.entity';
import { BookingPreview } from 'apps/libs/entities/bookings/booking-preview.entity';

import { generateId } from 'apps/libs/common/utils/generate-id';
import { getUTCDate } from 'apps/libs/common/utils/date';

import { Booking } from 'apps/libs/entities/bookings/booking.entity';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto';
import { BookingPaymentStatus } from 'apps/libs/common/enums/booking-payment-status.enum';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';

@Injectable()
export class PaymentBuilder {
    private payment: Partial<Payment> = {};

    constructor() {
        this.reset();
    }

    reset(): PaymentBuilder {
        const date = getUTCDate();
        const paymentId = `${date.getTime()}${generateId()}`;

        this.payment = {
            recordId: paymentId,
            createdAt: date.toISOString(),
            paymentDate: date.toISOString(),
        };
        return this;
    }

    withBasicData(bookingDto: CreateBookingDto, booking: Booking, user: Customer): PaymentBuilder {
        this.payment = {
            ...this.payment,
            bookingId: booking.recordId,
            hostId: bookingDto.hostId,
            productId: bookingDto.productId,
            dateId: bookingDto.dateId,
            planId: bookingDto.planId,
            amount: bookingDto.payment.amount,
            paymentMethodId: bookingDto.payment.paymentMethodId,
            referenceCode: bookingDto.payment.referenceCode,
            customerId: user.recordId,
            userId: user.userId,
        };
        return this;
    }

    withPaymentStatus(isFree: boolean, paymentStrategy: IPaymentStrategy): PaymentBuilder {
        if (isFree) this.payment.paymentStatus = PaymentStatus.CONFIRMED;
        else this.payment.paymentStatus = paymentStrategy.getPaymentStatus();
        this.payment.requiresCoordination = paymentStrategy.requiresCoordination();
        return this;
    }

    withPaymentOption(paymentStrategy: IPaymentStrategy): PaymentBuilder {
        this.payment.paymentMethod = paymentStrategy.getPaymentMethod();
        this.payment.currency = paymentStrategy.getCurrency();
        return this;
    }

    withPaymentReceipt(productId: string, paymentReceipt?: string): PaymentBuilder {
        if (paymentReceipt) {
            this.payment.paymentReceipt = this.generatePaymentReceiptPath(productId, paymentReceipt);
        }
        return this;
    }

    withConversionRates(bookingPreview?: BookingPreview): PaymentBuilder {
        if (bookingPreview?.conversionRates) {
            this.payment.conversionRates = bookingPreview.conversionRates;
        }
        return this;
    }

    build(): Payment {
        return this.payment as Payment;
    }

    private generatePaymentReceiptPath(productId: string, paymentReceipt?: string): string | undefined {
        const date = getUTCDate();

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const { filename } = this.extractFilenameFromReceipt(paymentReceipt);
        return filename ? `private/products/${productId}/payments/${formattedDate}/${filename}.jpeg` : undefined;
    }

    private extractFilenameFromReceipt(paymentReceipt?: string): { filename: string } {
        return paymentReceipt ? { filename: path.parse(paymentReceipt).name } : { filename: '' };
    }
}
