import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { BadRequestException } from '@nestjs/common';

import { IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';

import { convertToUTC, getUTCDate } from 'apps/libs/common/utils/date';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductDateStatus } from 'apps/libs/common/enums/product-date-status.enum';
import { SessionAvailabilityType } from 'apps/libs/common/enums/session-availability-type.enum';

import { SingleDate } from '../common/single-date.entity';
import { TimeSlot, WeeklyAvailability } from './weekly-availability.entity';
import { BaseProduct } from './product.entity';

export class SessionProduct extends BaseProduct {
    @IsEnum(SessionAvailabilityType)
    @IsNotEmpty()
    availabilityType: SessionAvailabilityType;

    @IsObject()
    @IsOptional()
    weeklyAvailability?: WeeklyAvailability;

    constructor(product: Partial<SessionProduct>) {
        super(product);
        this.productType = ProductType.ONE_TO_ONE_SESSION;

        if (this.availabilityType === SessionAvailabilityType.DEFINED_RANGE) {
            this.dates =
                product.dates
                    ?.map((date) => ({
                        ...date,
                        status: date.status ?? ProductDateStatus.DEPENDS_ON_DATE,
                        recordId: date.recordId ?? generateId(),
                    }))
                    .sort(this.sortDates) || [];
        }

        this.weeklyAvailability = product.weeklyAvailability;
        this.duration = product.duration;
    }

    /**
     * Validates if a booking date is within available date ranges for this session
     * @param bookingDate The date to validate
     * @returns true if date is valid, false otherwise
     */
    isValidBookingDate(bookingDate?: SingleDate): boolean {
        if (this.availabilityType === SessionAvailabilityType.CLIENT_AGREEMENT) return true;
        if (!bookingDate) throw new BadRequestException(ProductsErrorCodes.DatesRequired);

        // Check if booking date is in the future (both in UTC)
        const bookingDateUTC = convertToUTC(bookingDate).utcDate;
        const nowUTC = getUTCDate();

        if (bookingDateUTC <= nowUTC) {
            console.log('bookingDateUTC <= nowUTC', bookingDateUTC, nowUTC);
            return false;
        }

        if (this.availabilityType === SessionAvailabilityType.DEFINED_RANGE) {
            // Check if the date is within any of the defined date ranges
            if (this.dates && this.dates.length > 0) {
                return this.isWithinProductDateRanges(bookingDate) && this.isWithinWeeklyAvailability(bookingDate);
            }
        }

        // If no specific dates are defined but weekly availability exists
        if (this.weeklyAvailability) {
            return this.isWithinWeeklyAvailability(bookingDate);
        }

        return false;
    }

    /**
     * Checks if the booking date is within any of the product's defined date ranges
     */
    private isWithinProductDateRanges(bookingDate: SingleDate): boolean {
        const bookingDateUTC = convertToUTC(bookingDate).utcDate;

        return (this.dates || []).some((productDate) => {
            if (productDate.status === ProductDateStatus.MANUALLY_CLOSED) return false;

            const initialDateUTC = convertToUTC(productDate.initialDate).utcDate;
            if (!productDate.endDate) {
                return bookingDateUTC.getTime() >= initialDateUTC.getTime();
            }

            const endDateUTC = convertToUTC(productDate.endDate).utcDate;

            return (
                bookingDateUTC.getTime() >= initialDateUTC.getTime() && bookingDateUTC.getTime() <= endDateUTC.getTime()
            );
        });
    }

    /**
     * Checks if the booking date is within the weekly availability schedule
     */
    private isWithinWeeklyAvailability(bookingDate: SingleDate): boolean {
        if (!this.weeklyAvailability) return false;

        // Convert booking date to the product's timezone for proper day/time comparison
        const date = fromZonedTime(`${bookingDate.date}T${bookingDate.time}`, this.timezone);

        const dateInProductTimezone = toZonedTime(date, this.timezone);

        // Get day of week (0-6, Sunday is 0)
        const bookingDay = dateInProductTimezone.getDay();
        const time = format(dateInProductTimezone, 'HH:mm');

        // Map the day number to day name
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[bookingDay];

        // Access availability using the day name
        const dayAvailability = this.weeklyAvailability[dayName];

        // Check if this day of week has availability
        if (!dayAvailability) return false;

        // If no specific time check is needed, just confirm day is available
        if (!time) return true;

        // Check time against available hours
        // dayAvailability is an array of time slots
        const bookingTime = time.substring(0, 5); // Format HH:mm

        return dayAvailability.some((timeSlot: TimeSlot) => {
            // Generate 30-minute slots from the time range
            const startHour = parseInt(timeSlot.start.split(':')[0]);
            const startMinute = parseInt(timeSlot.start.split(':')[1]);
            const endHour = parseInt(timeSlot.end.split(':')[0]);
            const endMinute = parseInt(timeSlot.end.split(':')[1]);

            // Calculate start and end in minutes
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            // Generate all 30-minute slots
            const slots: string[] = [];
            for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 30) {
                const hour = Math.floor(minutes / 60);
                const minute = minutes % 60;
                slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            }

            // Check if booking time matches any of the generated slots
            return slots.includes(bookingTime);
        });
    }

    isReadyToBePublished(paymentOptionsExist: boolean): { result: boolean; message?: string } {
        console.log('verifying if session is ready to be published');
        if (!this.isFree && !paymentOptionsExist)
            return { result: false, message: ProductsErrorCodes.ProductIsNotReadyToBePublished };

        if (!this.duration) return { result: false, message: ProductsErrorCodes.DurationRequiredToBePublished };

        if (!this.plans || this.plans?.length == 0)
            return { result: false, message: ProductsErrorCodes.PlansAreRequiredToBePublished };

        if (!this.availabilityType)
            return { result: false, message: ProductsErrorCodes.AvailabilityTypeRequiredToBePublished };

        if (this.availabilityType != SessionAvailabilityType.CLIENT_AGREEMENT && !this.weeklyAvailability)
            return { result: false, message: ProductsErrorCodes.WeeklyAvailabilityRequiredToBePublished };

        return { result: true };
    }
}
