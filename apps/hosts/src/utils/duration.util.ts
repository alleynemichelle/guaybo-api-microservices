type DurationUnit = 'DD' | 'MM' | 'YY' | string | null;

export function calculateValidUntil(startDate: Date, duration: number, unit: DurationUnit): Date {
    const validUntil = new Date(startDate);
    switch (unit) {
        case 'DD':
            validUntil.setUTCDate(validUntil.getUTCDate() + duration);
            break;
        case 'MM':
            validUntil.setUTCMonth(validUntil.getUTCMonth() + duration);
            break;
        case 'YY':
            validUntil.setUTCFullYear(validUntil.getUTCFullYear() + duration);
            break;
        default:
            validUntil.setUTCMonth(validUntil.getUTCMonth() + 1); // Default 1 month
            break;
    }
    return validUntil;
}
