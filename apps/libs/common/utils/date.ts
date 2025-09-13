import { SingleDate } from 'apps/libs/domain/common/single-date.entity';
import { fromZonedTime, format, toZonedTime, formatInTimeZone } from 'date-fns-tz';

export function getUTCDate(date?: Date) {
    const now = date ?? new Date();

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();
    const milliseconds = now.getUTCMilliseconds();

    const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));

    return utcDate;
}

export function getLocalDate(utcDate: Date, timezone: string) {
    return toZonedTime(utcDate, timezone);
}

export function getLocalDateString(utcDate: string, timezone: string, dateFormat: string) {
    if (!utcDate) {
        return '';
    }

    const utcDateObj = new Date(utcDate);
    const zonedDate = toZonedTime(utcDateObj, timezone);
    return format(zonedDate, dateFormat, { timeZone: timezone });
}

export function getYearAndMonth(inputDate?: Date): { year: string; month: string } {
    const date = inputDate ? inputDate.toISOString() : getUTCDate().toISOString();

    const match = date.match(/^(\d{4})-(\d{2})/);
    const [, year, month] = match || [];

    return { year: year as string, month: month as string };
}

export function getYearMonthAndDay(inputDate?: Date): { year: string; month: string; day: string } {
    const date = inputDate ? inputDate.toISOString() : new Date().toISOString();

    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const [, year, month, day] = match || [];

    return {
        year: year as string,
        month: month as string,
        day: day as string,
    };
}

export function getPeriod(start: string, end: string, timezone: string): string {
    const startDate = getUTCDate(new Date(start));
    const closingDate = getUTCDate(new Date(end));
    const language = detectLanguageFromTimezone(timezone);
    // Formatter for the user's timezone
    const formatter = new Intl.DateTimeFormat(language, {
        timeZone: timezone,
        month: 'long',
        day: 'numeric',
    });

    const startFormatted = formatter.format(startDate);
    const closingFormatted = formatter.format(closingDate);

    return `${startFormatted} - ${closingFormatted}`;
}

export function productDateFormat(productDate: SingleDate): string {
    const { date, time } = productDate;

    if (date.includes('T')) {
        return date;
    }

    const dateTime = time ? `${time}:00` : '00:00:00';
    return `${date}T${dateTime}`;
}

function detectLanguageFromTimezone(timezone: string): string {
    try {
        const formatter = new Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return formatter.resolvedOptions().locale;
    } catch (error) {
        console.error('Invalid timezone or locale not detected:', error);
        return 'es-ES';
    }
}

export function convertToUTC(singleDate: SingleDate): { result: SingleDate; utcDate: Date } {
    const { date, time, timezone } = singleDate;

    const dateStr = date.includes('T') ? date : `${date}${time ? `T${time}:00` : 'T00:00:00'}`;
    const utcDate = fromZonedTime(dateStr, timezone);

    //  Build the return object
    const result: SingleDate = {
        date: formatInTimeZone(utcDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss"),
        ...(time && { time: formatInTimeZone(utcDate, 'UTC', 'HH:mm') }),
        timezone: 'UTC',
    };

    return { result, utcDate };
}
