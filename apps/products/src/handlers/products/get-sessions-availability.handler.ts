import { BadRequestException } from '@nestjs/common';

import { differenceInDays } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { SessionProduct } from 'apps/libs/domain/products/session.entity';
import { Unit } from 'apps/libs/common/enums/unit.enum';
import { SessionAvailabilityType } from 'apps/libs/common/enums/session-availability-type.enum';
import { convertToUTC } from 'apps/libs/common/utils/date';
import { GetSessionAvailabilityDto } from '../../dto/requests/get-session-availability.dto';

export class GetSessionsAvailabilityHandler {
    constructor(private readonly productsRepository: ProductsRepository) {}

    /**
     * Get availability slots for a session-type product
     * This method calculates all available time slots for a given date range, considering:
     * - The product's weekly availability configuration
     * - Existing bookings that might block slots
     * - Different timezone handling between client and product
     */
    async execute(hostId: string, productId: string, params: GetSessionAvailabilityDto): Promise<any | null> {
        // Get the product and validate it's a session product
        const product = await this.productsRepository.findByRecordId(productId);
        if (!product || product.recordStatus == Status.DELETED) {
            throw new BadRequestException(ProductsErrorCodes.ProductNotFound);
        }

        if (product.productType !== ProductType.ONE_TO_ONE_SESSION) {
            throw new BadRequestException(ProductsErrorCodes.ProductInvalidType);
        }

        const sessionProduct = new SessionProduct(product);
        if (!sessionProduct.weeklyAvailability) {
            throw new BadRequestException(ProductsErrorCodes.WeeklyAvailabilityRequiredToBePublished);
        }

        // Handle timezone information for accurate time calculations
        const clientTimezone = params.timezone || 'UTC';
        const productTimezone = sessionProduct.timezone || 'UTC';

        // Get session duration in minutes (defaults to 60 when not provided)
        let sessionDurationMinutes = 60;

        if (sessionProduct.duration && typeof sessionProduct.duration === 'object') {
            const { quantity, unit } = sessionProduct.duration as { quantity: number; unit: Unit };

            if (quantity && unit) {
                switch (unit) {
                    case Unit.MINUTES:
                        sessionDurationMinutes = quantity;
                        break;
                    case Unit.HH:
                        sessionDurationMinutes = quantity * 60;
                        break;
                    case Unit.DD:
                        sessionDurationMinutes = quantity * 60 * 24;
                        break;
                    default:
                        sessionDurationMinutes = quantity;
                        break;
                }
            }
        }

        // Parse start and end dates
        let startDateUtc = fromZonedTime(`${params.startDate}T00:00:00Z`, clientTimezone);
        let endDateUtc = fromZonedTime(`${params.endDate}T23:59:59Z`, clientTimezone);

        // Adjust dates if product has DEFINED_RANGE availability type
        if (
            sessionProduct.availabilityType === SessionAvailabilityType.DEFINED_RANGE &&
            sessionProduct.dates &&
            sessionProduct.dates.length > 0
        ) {
            // Check each product date range to adjust the start and end dates if necessary
            sessionProduct.dates.forEach((dateRange) => {
                // Convert initialDate to UTC for comparison
                const initialDateUtc = convertToUTC(dateRange.initialDate).utcDate;

                // If product's initialDate is later than requested startDate, use product's initialDate
                if (initialDateUtc > startDateUtc) {
                    startDateUtc = initialDateUtc;
                }

                // If this date range has an endDate
                if (dateRange.endDate) {
                    const endDateRangeUtc = convertToUTC(dateRange.endDate).utcDate;

                    // If product's endDate is earlier than requested endDate, use product's endDate
                    if (endDateRangeUtc < endDateUtc) {
                        endDateUtc = endDateRangeUtc;
                    }
                }
            });
        }

        // Validate the date range is within acceptable limits (1-31 days)
        const daysCount = differenceInDays(new Date(endDateUtc), new Date(startDateUtc)) + 1;
        if (daysCount <= 0 || daysCount > 120) {
            throw new BadRequestException('Date range must be between 1 and 120 days');
        }

        // // Fetch existing bookings for this product within the date range
        // const existingBookings = await this.productsOpenSearchService.getProductBookings(
        //     hostId,
        //     productId,
        //     startDateUtc.toISOString(),
        //     endDateUtc.toISOString(),
        // );

        // // Get the weekly availability schedule from the product
        // const weeklyAvailability = sessionProduct.weeklyAvailability;
        // const days: DayAvailability[] = [];

        // // Precompute booked slots to improve performance
        // const bookedSlots = existingBookings.map((booking) => ({
        //     start: new Date(`${booking.date.initialDate.date}Z`),
        //     end: new Date(`${booking.date.endDate.date}Z`),
        // }));

        // // Iterate through each day in the date range
        // for (let i = 0; i < daysCount; i++) {
        //     const currentDateInProductTZ = addDays(new Date(startDateUtc), i);
        //     const dayOfWeek = formatInTimeZone(currentDateInProductTZ, 'UTC', 'EEEE').toLowerCase();
        //     const dayAvailability = weeklyAvailability[dayOfWeek];

        //     // Skip days with no availability
        //     if (!dayAvailability || dayAvailability.length === 0) {
        //         continue;
        //     }

        //     const potentialTimeSlots: { time: string; dateTime: Date }[] = [];

        //     // First, collect all potential time slots for this day
        //     dayAvailability.forEach((timeSlot: TimeSlot) => {
        //         const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
        //         const [endHour, endMinute] = timeSlot.end.split(':').map(Number);

        //         // Convert times to total minutes
        //         const startTotalMinutes = startHour * 60 + startMinute;
        //         const endTotalMinutes = endHour * 60 + endMinute;

        //         // Generate potential slots in 30-minute intervals within the available time range
        //         // Allow slots to start even if the session extends beyond the available window
        //         for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 30) {
        //             const hour = Math.floor(minutes / 60);
        //             const minute = minutes % 60;
        //             const date = formatInTimeZone(currentDateInProductTZ, 'UTC', 'yyyy-MM-dd');
        //             const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        //             const fullDateTime = `${date}T${time}:00`;

        //             const dateTimeUtc = fromZonedTime(fullDateTime, productTimezone);
        //             const dateTimeInClientTZ = toZonedTime(dateTimeUtc, clientTimezone);

        //             // Check if this slot is not in the past
        //             if (dateTimeUtc > getUTCDate()) {
        //                 potentialTimeSlots.push({
        //                     time: format(dateTimeInClientTZ, 'HH:mm'),
        //                     dateTime: dateTimeUtc,
        //                 });
        //             }
        //         }
        //     });

        //     // Now filter out slots that would conflict with existing bookings
        //     // or with other potential slots considering session duration
        //     const availableTimeSlots: string[] = [];

        //     for (const slot of potentialTimeSlots) {
        //         const slotStart = slot.dateTime;
        //         // Calculate the end time by adding the session duration in milliseconds
        //         const durationMs = sessionDurationMinutes * 60 * 1000;
        //         const slotEnd = new Date(slotStart.getTime() + durationMs);

        //         // Check if this slot conflicts with any existing booking
        //         const conflictsWithBooking = bookedSlots.some((booking) => {
        //             return (
        //                 (slotStart >= booking.start && slotStart < booking.end) ||
        //                 (slotEnd > booking.start && slotEnd <= booking.end) ||
        //                 (slotStart <= booking.start && slotEnd >= booking.end)
        //             );
        //         });

        //         if (!conflictsWithBooking) {
        //             availableTimeSlots.push(slot.time);
        //         }
        //     }

        //     // Only add days that have available slots
        //     if (availableTimeSlots.length > 0) {
        //         const formattedDate = formatInTimeZone(currentDateInProductTZ, 'UTC', 'yyyy-MM-dd');
        //         days.push({
        //             date: formattedDate,
        //             times: availableTimeSlots.sort(),
        //         });
        //     }
        // }

        // Return the complete availability response
        // return {
        //     hostId,
        //     productId,
        //     timezone: clientTimezone,
        //     days,
        // };

        return null;
    }
}
