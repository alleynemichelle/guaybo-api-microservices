import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { attendee, booking, bookingDiscount, bookingItem, invoice, userAnswer, userAnswerOption } from '../schemas';

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
