import { BadRequestException } from '@nestjs/common';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { WeeklyAvailability } from 'apps/libs/entities/products/weekly-availability.entity';

/**
 * Validates the weekly availability configuration
 * Checks:
 * 1. If a day is in the payload, it must have at least one slot
 * 2. Each slot must have valid start/end times (end > start)
 * 3. Slots within the same day must not overlap
 * @param weeklyAvailability The weekly availability configuration to validate
 */
export function validateWeeklyAvailability(weeklyAvailability: WeeklyAvailability): void {
    for (const slots of Object.values(weeklyAvailability)) {
        // If day is included in payload but slots array is empty or missing
        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            throw new BadRequestException(ProductsErrorCodes.WeeklyAvailabilityDayEmpty);
        }

        // Check for overlapping slots if slots are defined for this day
        if (slots && slots.length > 0) {
            // Check all slot combinations for overlaps
            for (let i = 0; i < slots.length; i++) {
                const slotA = slots[i];

                // Convert times to minutes for comparison
                const [startHourA, startMinuteA] = slotA.start.split(':').map(Number);
                const [endHourA, endMinuteA] = slotA.end.split(':').map(Number);

                const startMinutesA = startHourA * 60 + startMinuteA;
                const endMinutesA = endHourA * 60 + endMinuteA;

                // Verify this slot has valid start/end times
                if (endMinutesA <= startMinutesA) {
                    throw new BadRequestException(ProductsErrorCodes.InvalidDateRange);
                }

                // Compare with all other slots
                for (let j = i + 1; j < slots.length; j++) {
                    const slotB = slots[j];

                    // Convert times to minutes for comparison
                    const [startHourB, startMinuteB] = slotB.start.split(':').map(Number);
                    const [endHourB, endMinuteB] = slotB.end.split(':').map(Number);

                    const startMinutesB = startHourB * 60 + startMinuteB;
                    const endMinutesB = endHourB * 60 + endMinuteB;

                    // Check for overlap
                    // Two slots overlap if one starts before the other ends
                    if (
                        (startMinutesA < endMinutesB && endMinutesA > startMinutesB) ||
                        (startMinutesB < endMinutesA && endMinutesB > startMinutesA)
                    ) {
                        throw new BadRequestException(ProductsErrorCodes.WeeklyAvailabilitySlotsOverlap);
                    }
                }
            }
        }
    }
}
