import {
    bigint,
    boolean,
    integer,
    numeric,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
    varchar,
    uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { discount } from './billing.schema';
import { paymentMethod, status } from './common.schema';
import { answerOption, product, productDate, productPlan, question } from './products.schema';
import { appUser } from './users.schema';
import { host } from './hosts.schema';

export const invoice = pgTable('invoice', {
    id: serial('id').primaryKey(),
    recordId: bigint('record_id', { mode: 'number' }).notNull().unique(),
    hostId: bigint('host_id', { mode: 'number' })
        .notNull()
        .references(() => host.id, { onDelete: 'cascade' }),
    statusId: bigint('status_id', { mode: 'number' })
        .notNull()
        .references(() => status.id),
    startBillingDate: timestamp('start_billing_date', {
        withTimezone: true,
    }).notNull(),
    closingBillingDate: timestamp('closing_billing_date', {
        withTimezone: true,
    }).notNull(),
    subtotal: bigint('subtotal', { mode: 'number' }).notNull(),
    paidCommissions: bigint('paid_commissions', { mode: 'number' }).default(0),
    total: bigint('total', { mode: 'number' }),
    billingTotal: bigint('billing_total', { mode: 'number' }).notNull(),
    delayed: boolean('delayed').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
    host: one(host, {
        fields: [invoice.hostId],
        references: [host.id],
    }),
    status: one(status, {
        fields: [invoice.statusId],
        references: [status.id],
    }),
    bookings: many(booking),
    invoiceBreakdowns: many(invoiceBreakdown),
    invoiceItems: many(invoiceItem),
    invoicePayments: many(invoicePayment),
}));

export const booking = pgTable('booking', {
    id: serial('id').primaryKey(),
    recordId: bigint('record_id', { mode: 'number' }).notNull().unique(),
    invoiceId: bigint('invoice_id', { mode: 'number' })
        .notNull()
        .references(() => invoice.id, { onDelete: 'set null' }),
    hostId: bigint('host_id', { mode: 'number' })
        .notNull()
        .references(() => host.id, { onDelete: 'cascade' }),
    buyerId: bigint('buyer_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'set null' }),
    ticketNumber: varchar('ticket_number', { length: 100 }),
    paymentMode: varchar('payment_mode', { length: 50 }),
    bookingStatusId: bigint('booking_status_id', { mode: 'number' }).references(() => status.id, {
        onDelete: 'set null',
    }),
    paymentStatusId: bigint('payment_status_id', { mode: 'number' }).references(() => status.id, {
        onDelete: 'set null',
    }),
    paymentMethodId: bigint('payment_method_id', { mode: 'number' }).references(() => paymentMethod.id, {
        onDelete: 'set null',
    }),
    timezone: varchar('timezone', { length: 100 }),
    isTest: boolean('is_test').default(false),
    freeAccess: boolean('free_access').default(false),
    appFeeAmount: bigint('app_fee_amount', { mode: 'number' }),
    appFeeCommissionPayer: varchar('app_fee_commission_payer', { length: 50 }),
    conversionCurrency: varchar('conversion_currency', { length: 10 }),
    exchangeRate: numeric('exchange_rate', { precision: 18, scale: 6 }),
    amountUsd: bigint('amount_usd', { mode: 'number' }),
    amountConverted: bigint('amount_converted', { mode: 'number' }),
    subtotal: bigint('subtotal', { mode: 'number' }),
    total: bigint('total', { mode: 'number' }),
    discountedAmount: bigint('discounted_amount', { mode: 'number' }),
    remainingAmount: bigint('remaining_amount', { mode: 'number' }),
    totalInstallments: integer('total_installments'),
    installmentsInterestFee: bigint('installments_interest_fee', {
        mode: 'number',
    }),
    installmentsProgramApplied: boolean('installments_program_applied').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const bookingRelations = relations(booking, ({ one, many }) => ({
    invoice: one(invoice, {
        fields: [booking.invoiceId],
        references: [invoice.id],
    }),
    host: one(host, {
        fields: [booking.hostId],
        references: [host.id],
    }),
    buyer: one(appUser, {
        fields: [booking.buyerId],
        references: [appUser.id],
    }),
    bookingStatus: one(status, {
        fields: [booking.bookingStatusId],
        references: [status.id],
    }),
    paymentStatus: one(status, {
        fields: [booking.paymentStatusId],
        references: [status.id],
    }),
    paymentMethod: one(paymentMethod, {
        fields: [booking.paymentMethodId],
        references: [paymentMethod.id],
    }),
    bookingItems: many(bookingItem),
    bookingDiscounts: many(bookingDiscount),
    attendees: many(attendee),
}));

export const bookingItem = pgTable('booking_item', {
    id: serial('id').primaryKey(),
    bookingId: bigint('booking_id', { mode: 'number' })
        .notNull()
        .references(() => booking.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' })
        .notNull()
        .references(() => product.id, { onDelete: 'cascade' }),
    planId: bigint('plan_id', { mode: 'number' }).references(() => productPlan.id, { onDelete: 'set null' }),
    dateId: bigint('date_id', { mode: 'number' }).references(() => productDate.id, { onDelete: 'set null' }),
    discountId: bigint('discount_id', { mode: 'number' }).references(() => discount.id, { onDelete: 'set null' }),
    fareType: varchar('fare_type', { length: 50 }),
    price: bigint('price', { mode: 'number' }).notNull(),
    finalPrice: bigint('final_price', { mode: 'number' }).notNull(),
    quantity: integer('quantity').notNull(),
    totalAmount: bigint('total_amount', { mode: 'number' }).notNull(),
});

export const bookingItemRelations = relations(bookingItem, ({ one }) => ({
    booking: one(booking, {
        fields: [bookingItem.bookingId],
        references: [booking.id],
    }),
    product: one(product, {
        fields: [bookingItem.productId],
        references: [product.id],
    }),
    plan: one(productPlan, {
        fields: [bookingItem.planId],
        references: [productPlan.id],
    }),
    date: one(productDate, {
        fields: [bookingItem.dateId],
        references: [productDate.id],
    }),
    discount: one(discount, {
        fields: [bookingItem.discountId],
        references: [discount.id],
    }),
}));

export const bookingDiscount = pgTable('booking_discount', {
    id: serial('id').primaryKey(),
    bookingId: bigint('booking_id', { mode: 'number' })
        .notNull()
        .references(() => booking.id, { onDelete: 'cascade' }),
    discountId: bigint('discount_id', { mode: 'number' }).references(() => discount.id),
    amount: bigint('amount', { mode: 'number' }).notNull(),
});

export const bookingDiscountRelations = relations(bookingDiscount, ({ one }) => ({
    booking: one(booking, {
        fields: [bookingDiscount.bookingId],
        references: [booking.id],
    }),
    discount: one(discount, {
        fields: [bookingDiscount.discountId],
        references: [discount.id],
    }),
}));

export const attendee = pgTable('attendee', {
    id: serial('id').primaryKey(),
    bookingId: bigint('booking_id', { mode: 'number' })
        .notNull()
        .references(() => booking.id, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const attendeeRelations = relations(attendee, ({ one }) => ({
    booking: one(booking, {
        fields: [attendee.bookingId],
        references: [booking.id],
    }),
    user: one(appUser, {
        fields: [attendee.userId],
        references: [appUser.id],
    }),
}));

export const userAnswer = pgTable(
    'user_answer',
    {
        id: serial('id').primaryKey(),
        recordId: uuid('record_id').defaultRandom().notNull().unique(),
        questionId: bigint('question_id', { mode: 'number' })
            .notNull()
            .references(() => question.id, { onDelete: 'cascade' }),
        userId: bigint('user_id', { mode: 'number' })
            .notNull()
            .references(() => appUser.id, { onDelete: 'cascade' }),
        answerText: text('answer_text'),
        ratingValue: integer('rating_value'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return {
            questionUserUnique: unique('user_answer_question_id_user_id_unique').on(table.questionId, table.userId),
        };
    },
);

export const userAnswerRelations = relations(userAnswer, ({ one, many }) => ({
    question: one(question, {
        fields: [userAnswer.questionId],
        references: [question.id],
    }),
    user: one(appUser, {
        fields: [userAnswer.userId],
        references: [appUser.id],
    }),
    userAnswerOptions: many(userAnswerOption),
}));

export const userAnswerOption = pgTable(
    'user_answer_option',
    {
        id: serial('id').primaryKey(),
        userAnswerId: bigint('user_answer_id', { mode: 'number' })
            .notNull()
            .references(() => userAnswer.id, { onDelete: 'cascade' }),
        answerOptionId: bigint('answer_option_id', { mode: 'number' })
            .notNull()
            .references(() => answerOption.id, { onDelete: 'cascade' }),
    },
    (table) => {
        return {
            userAnswerOptionUnique: unique('user_answer_option_user_answer_id_answer_option_id_unique').on(
                table.userAnswerId,
                table.answerOptionId,
            ),
        };
    },
);

export const userAnswerOptionRelations = relations(userAnswerOption, ({ one }) => ({
    userAnswer: one(userAnswer, {
        fields: [userAnswerOption.userAnswerId],
        references: [userAnswer.id],
    }),
    answerOption: one(answerOption, {
        fields: [userAnswerOption.answerOptionId],
        references: [answerOption.id],
    }),
}));

export const invoiceBreakdown = pgTable('invoice_breakdown', {
    id: serial('id').primaryKey(),
    invoiceId: bigint('invoice_id', { mode: 'number' })
        .notNull()
        .references(() => invoice.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    calculatedAmount: bigint('calculated_amount', { mode: 'number' }),
    orderIndex: integer('order_index'),
});

export const invoiceBreakdownRelations = relations(invoiceBreakdown, ({ one }) => ({
    invoice: one(invoice, {
        fields: [invoiceBreakdown.invoiceId],
        references: [invoice.id],
    }),
}));

export const invoiceItem = pgTable('invoice_item', {
    id: serial('id').primaryKey(),
    invoiceId: bigint('invoice_id', { mode: 'number' })
        .notNull()
        .references(() => invoice.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
});

export const invoiceItemRelations = relations(invoiceItem, ({ one }) => ({
    invoice: one(invoice, {
        fields: [invoiceItem.invoiceId],
        references: [invoice.id],
    }),
}));

export const invoicePayment = pgTable('invoice_payment', {
    id: serial('id').primaryKey(),
    invoiceId: bigint('invoice_id', { mode: 'number' })
        .notNull()
        .references(() => invoice.id, { onDelete: 'cascade' }),
    paymentMethodId: bigint('payment_method_id', { mode: 'number' })
        .notNull()
        .references(() => paymentMethod.id, { onDelete: 'cascade' }),
    referenceCode: varchar('reference_code', { length: 100 }),
    receipt: varchar('receipt', { length: 1000 }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const invoicePaymentRelations = relations(invoicePayment, ({ one }) => ({
    invoice: one(invoice, {
        fields: [invoicePayment.invoiceId],
        references: [invoice.id],
    }),
    paymentMethod: one(paymentMethod, {
        fields: [invoicePayment.paymentMethodId],
        references: [paymentMethod.id],
    }),
}));
