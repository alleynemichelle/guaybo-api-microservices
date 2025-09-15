import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    appUser,
    attendee,
    booking,
    bookingDiscount,
    bookingItem,
    currency,
    host,
    invoice,
    paymentMethod,
    product,
    productDate,
    productPlan,
    status,
    userAnswer,
    userAnswerOption,
} from '../schemas';

export type Invoice = InferSelectModel<typeof invoice>;
export type NewInvoice = InferInsertModel<typeof invoice>;

export type Booking = InferSelectModel<typeof booking>;
export type NewBooking = InferInsertModel<typeof booking>;

export type BookingItem = InferSelectModel<typeof bookingItem>;
export type NewBookingItem = InferInsertModel<typeof bookingItem>;

export type BookingDiscount = InferSelectModel<typeof bookingDiscount>;
export type NewBookingDiscount = InferInsertModel<typeof bookingDiscount>;

export type Attendee = InferSelectModel<typeof attendee>;
export type NewAttendee = InferInsertModel<typeof attendee>;

export type UserAnswer = InferSelectModel<typeof userAnswer>;
export type NewUserAnswer = InferInsertModel<typeof userAnswer>;

export type UserAnswerOption = InferSelectModel<typeof userAnswerOption>;
export type NewUserAnswerOption = InferInsertModel<typeof userAnswerOption>;

export type BookingWithStatus = Booking & {
    bookingStatus: InferSelectModel<typeof status>;
    paymentStatus: InferSelectModel<typeof status>;
};

export type BookingWithRelations = BookingWithStatus & {
    product: InferSelectModel<typeof product>;
    host: InferSelectModel<typeof host>;
    user: InferSelectModel<typeof appUser>;
    plan: InferSelectModel<typeof productPlan>;
    date: InferSelectModel<typeof productDate>;
    paymentMethod: InferSelectModel<typeof paymentMethod> & { currency: InferSelectModel<typeof currency> };
    invoice: InferSelectModel<typeof invoice>;
    attendees: InferSelectModel<typeof attendee>[];
    bookingItems: InferSelectModel<typeof bookingItem>[];
    bookingDiscounts: InferSelectModel<typeof bookingDiscount>[];
};
