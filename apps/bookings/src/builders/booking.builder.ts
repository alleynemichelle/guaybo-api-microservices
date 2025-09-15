import { Injectable } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Booking, BookingBilling } from 'apps/libs/entities/bookings/booking.entity';

import { BookingPreview } from 'apps/libs/entities/bookings/booking-preview.entity';
import { Customer } from 'apps/libs/entities/users/customer.entity';
import { BaseProduct } from 'apps/libs/entities/products/product.entity';
import { SessionProduct } from 'apps/libs/entities/products/session.entity';
import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { BookingPaymentStatus } from 'apps/libs/common/enums/booking-payment-status.enum';
import { PaymentMode } from 'apps/libs/common/enums/payment-mode.enum';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { convertToUTC } from 'apps/libs/common/utils/date';

import { Attendee } from 'apps/libs/entities/common/attendee.entity';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { Host } from 'apps/libs/entities/hosts/hosts.entity';
import { SingleDate } from 'apps/libs/entities/common/single-date.entity';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto';
/**
 * Builder for creating Booking entities
 */
@Injectable()
export class BookingBuilder {
    private booking: Partial<Booking> = {};

    constructor() {
        this.reset();
    }

    /**
     * Resets the builder for new booking creation
     */
    reset(): BookingBuilder {
        const bookingDate = getUTCDate();
        const ticketNumber = generateId();
        const bookingId = `${bookingDate.getTime().toString()}${ticketNumber}`;

        this.booking = {
            recordId: bookingId,
            alias: ticketNumber,
            createdAt: bookingDate.toISOString(),
            updatedAt: bookingDate.toISOString(),
            ticketNumber: ticketNumber,
        };
        return this;
    }

    /**
     * Sets basic booking data
     */
    withBasicBookingData(
        bookingDto: CreateBookingDto,
        bookingPreview: BookingPreview,
        user: Customer,
        host: Host,
        product: BaseProduct,
    ): BookingBuilder {
        const { hostId, ...userData } = user;

        this.booking = {
            ...this.booking,
            hostId: bookingDto.hostId,
            productId: bookingDto.productId,
            planId: bookingDto.planId,
            dateId: bookingDto.dateId,
            userId: user.userId,
            customerId: user.recordId,
            email: bookingDto.user.email,
            currency: bookingDto.currency,
            bookingStatus: BookingStatus.RECEIVED,
            paymentStatus: product.bookingSettings?.defaultPaymentStatus,
            bookingPreview,
            attendees: bookingDto.attendees.map(
                (attendeeDto) =>
                    ({
                        email: attendeeDto.email,
                        firstName: attendeeDto.firstName,
                        lastName: attendeeDto.lastName,
                        phoneNumber: attendeeDto.phoneNumber,
                        instagramAccount: attendeeDto.instagramAccount,
                    }) as Attendee,
            ),
            totalAttendees: bookingDto.totalAttendees,
            timezone: bookingDto.timezone,
            user: userData as Attendee,
            paymentMode: bookingDto.applyInstallments ? PaymentMode.INSTALLMENTS : PaymentMode.UPFRONT,
            isTest: bookingDto.user.email.toLowerCase() == host.email.toLowerCase(),
            freeAccess: product.isFree,
        };

        return this;
    }

    /**
     * Sets product-related data
     */
    withProductData(product: BaseProduct, planId: string, dateId: string, sessionDate?: SingleDate): BookingBuilder {
        const plan = product?.plans?.find((plan) => plan.recordId === planId);
        let date = product?.dates?.find((date) => date.recordId === dateId);
        let sessionInitialDate: string | undefined;
        let sessionEndDate: string | undefined;

        if (sessionDate && product?.duration) {
            const endDate = addMinutes(convertToUTC(sessionDate).utcDate, product?.getDurationInMinutes());
            sessionInitialDate = convertToUTC(sessionDate).result.date;
            sessionEndDate = formatInTimeZone(endDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss");
            date = {
                initialDate: {
                    date: sessionInitialDate,
                    timezone: 'UTC',
                },
                endDate: {
                    date: sessionEndDate,
                    timezone: 'UTC',
                },
            };
        }

        this.booking = {
            ...this.booking,
            ...(plan && { plan }),
            ...(date && { date }),
            ...(product.productType === ProductType.ONE_TO_ONE_SESSION && {
                availabilityType: (product as SessionProduct).availabilityType,
            }),
        };

        return this;
    }

    /**
     * Sets product-specific data (session dates, etc.)
     */
    withProductSpecificData(productData: any): BookingBuilder {
        this.booking = {
            ...this.booking,
            ...productData,
        };

        return this;
    }

    /**
     * Sets billing-related data
     */
    withBillingData(billing: BookingBilling): BookingBuilder {
        this.booking = {
            ...this.booking,
            invoiceId: billing?.invoiceId || '',
            billing,
        };

        return this;
    }

    /**
     * Sets payment status
     */
    withPaymentStatus(paymentStatus: BookingPaymentStatus): BookingBuilder {
        this.booking = {
            ...this.booking,
            paymentStatus,
        };

        return this;
    }

    /**
     * Sets session dates for session products
     */
    withSessionData(sessionData: any): BookingBuilder {
        this.booking = {
            ...this.booking,
            ...sessionData,
        };

        return this;
    }

    withAttendees(attendees: Attendee[]): BookingBuilder {
        this.booking.attendees = attendees;
        return this;
    }

    withBookingStatus(status: BookingStatus): BookingBuilder {
        this.booking.bookingStatus = status;
        return this;
    }

    withBookingPaymentStatus(isFree: boolean): BookingBuilder {
        if (isFree) this.booking.paymentStatus = BookingPaymentStatus.COMPLETED;
        else this.booking.paymentStatus = BookingPaymentStatus.CONFIRMATION_PENDING;

        return this;
    }

    withBookingPreview(preview: boolean): BookingBuilder {
        if (preview) {
            this.booking.bookingPreview = {
                appFee: {
                    commissionPayer: CommissionPayer.HOST,
                    amount: 0,
                },
                discountedAmount: 0,
                discounts: [],
                installmentsProgramApplied: false,
                items: [],
                remainingAmount: 0,
                subtotal: 0,
                total: 0,
            };
        } else {
            this.booking.bookingPreview = undefined;
        }
        return this;
    }

    /**
     * Sets payment method data
     */
    withPaymentMethod(paymentMethod?: PaymentMethod): BookingBuilder {
        if (paymentMethod) {
            this.booking = {
                ...this.booking,
                paymentMethod: paymentMethod,
            };
        }
        return this;
    }

    build(): Booking {
        return this.booking as Booking;
    }
}
