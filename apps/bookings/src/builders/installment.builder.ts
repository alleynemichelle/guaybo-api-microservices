import { Injectable } from '@nestjs/common';
import { Installment } from 'apps/libs/entities/bookings/installment.entity';
import { Customer } from 'apps/libs/entities/users/customer.entity';
import { BookingPreview } from 'apps/libs/entities/bookings/booking-preview.entity';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto';

@Injectable()
export class InstallmentBuilder {
    private installments: Partial<Installment>[] = [];

    constructor() {
        this.reset();
    }

    reset(): InstallmentBuilder {
        this.installments = [];
        return this;
    }

    withInstallments(
        bookingDto: CreateBookingDto,
        bookingId: string,
        paymentId: string,
        user: Customer,
        bookingPreview: BookingPreview,
        paymentStatus: PaymentStatus,
    ): InstallmentBuilder {
        if (bookingPreview.installments && bookingPreview.installmentsProgramApplied) {
            const date = getUTCDate();

            this.installments = bookingPreview.installments.map((installment, index) => ({
                recordId: `${date.getTime()}-${index + 1}`,
                createdAt: date.toISOString(),
                bookingId,
                hostId: bookingDto.hostId,
                productId: bookingDto.productId,
                dateId: bookingDto.dateId,
                planId: bookingDto.planId,
                customerId: user.recordId,
                userId: user.userId,
                amount: installment.amount,
                dueDate: installment.dueDate,
                order: index + 1,
                totalInstallments: bookingPreview.installments?.length || 0,
                paymentStatus: index === 0 ? paymentStatus : PaymentStatus.PENDING,
                ...(index === 0 ? { paymentId, paymentDate: date.toISOString() } : {}),
            }));
        }
        return this;
    }

    build(): Installment[] {
        return this.installments as Installment[];
    }
}
