import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { Booking } from 'apps/libs/domain/bookings/booking-v2.entity';
import { Booking as BookingType, BookingWithRelations, BookingWithStatus } from '../types';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { PaymentMode } from 'apps/libs/common/enums/payment-mode.enum';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';

export class BookingMapper {
    public static toDomain(row: BookingWithRelations): Booking {
        new Booking({
            id: row.id,
            recordId: row.recordId.toString(),
            productId: row.product.recordId.toString(),
            invoiceId: row.invoice.recordId.toString(),
            hostId: row.host.recordId.toString(),
            userId: row.user?.recordId.toString(),
            planId: row.plan?.recordId.toString(),
            dateId: row.date?.recordId.toString(),
            ticketNumber: row.recordId.toString(),
            paymentMode: row.paymentMode as PaymentMode,
            alias: row.recordId.toString(),
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
            bookingStatus: row.bookingStatus?.name as BookingStatus,
            paymentStatus: row.paymentStatus?.name as PaymentStatus,
            recordType: DatabaseKeys.BOOKING,
            paymentMethod: {
                id: row.paymentMethod?.id,
                key: row.paymentMethod?.key as PaymentMethod,
                currency: row.paymentMethod?.currency?.code as Currency,
            },
            timezone: row.timezone || 'America/Caracas',
            totalAttendees: row.totalAttendees || 1,
            user: {
                id: row.user?.id,
                recordId: row.user?.recordId.toString(),
            },
            plan: {
                id: row.plan?.id,
                recordId: row.plan?.recordId.toString(),
                name: row.plan?.name,
            },
            date: {
                id: row.date?.id,
                recordId: row.date?.recordId.toString(),
                date: row.date?.date,
                initialDate: row.date?.initialDate,
                endDate: row.date?.endDate,
                timezone: row.date?.timezone,
            },
        });
    }
}
