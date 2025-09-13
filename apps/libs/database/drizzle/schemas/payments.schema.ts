import {
    bigint,
    decimal,
    integer,
    jsonb,
    numeric,
    pgTable,
    serial,
    timestamp,
    unique,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { booking } from './bookings.schema';
import { currency, paymentMethod, status, transactionType } from './common.schema';
import { appUser } from './users.schema';
import { host } from './hosts.schema';

export const paymentOption = pgTable('payment_option', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    ownerType: varchar('owner_type', { length: 50 }).notNull(),
    userId: bigint('user_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'cascade' }),
    paymentMethodId: bigint('payment_method_id', { mode: 'number' })
        .notNull()
        .references(() => paymentMethod.id, { onDelete: 'restrict' }),
    customAttributes: jsonb('custom_attributes'),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Tabla de relación many-to-many entre host y payment_option
export const hostPaymentOption = pgTable(
    'host_payment_option',
    {
        id: serial('id').primaryKey(),
        recordId: uuid('record_id').defaultRandom().notNull().unique(),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        paymentOptionId: bigint('payment_option_id', { mode: 'number' })
            .notNull()
            .references(() => paymentOption.id, { onDelete: 'cascade' }),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => ({
        uniqueHostPaymentOption: unique().on(table.hostId, table.paymentOptionId),
    }),
);

export const paymentOptionRelations = relations(paymentOption, ({ one, many }) => ({
    status: one(status, {
        fields: [paymentOption.statusId],
        references: [status.id],
    }),
    paymentMethod: one(paymentMethod, {
        fields: [paymentOption.paymentMethodId],
        references: [paymentMethod.id],
    }),
    user: one(appUser, {
        fields: [paymentOption.userId],
        references: [appUser.id],
    }),
    hostPaymentOptions: many(hostPaymentOption),
}));

export const hostPaymentOptionRelations = relations(hostPaymentOption, ({ one }) => ({
    host: one(host, {
        fields: [hostPaymentOption.hostId],
        references: [host.id],
    }),
    paymentOption: one(paymentOption, {
        fields: [hostPaymentOption.paymentOptionId],
        references: [paymentOption.id],
    }),
    status: one(status, {
        fields: [hostPaymentOption.statusId],
        references: [status.id],
    }),
}));

export const payment = pgTable('payment', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    bookingId: bigint('booking_id', { mode: 'number' })
        .notNull()
        .references(() => booking.id, { onDelete: 'cascade' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    paymentOptionId: bigint('payment_option_id', { mode: 'number' })
        .notNull()
        .references(() => paymentOption.id, { onDelete: 'cascade' }),
    paymentDate: timestamp('payment_date', { withTimezone: true }).defaultNow(),
    paymentReceipt: varchar('payment_receipt', { length: 1000 }),
    paymentStatusId: bigint('payment_status_id', { mode: 'number' }).references(() => status.id),
    referenceCode: varchar('reference_code', { length: 100 }),
    exchangeRate: numeric('exchange_rate', { precision: 18, scale: 6 }),
    amountConverted: bigint('amount_converted', { mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const installment = pgTable('installment', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    bookingId: bigint('booking_id', { mode: 'number' })
        .notNull()
        .references(() => booking.id, { onDelete: 'cascade' }),
    installmentNumber: integer('installment_number').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    paymentId: bigint('payment_id', { mode: 'number' }).references(() => payment.id, { onDelete: 'set null' }),
    paymentStatusId: bigint('payment_status_id', { mode: 'number' }).references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const bankNotification = pgTable('bank_notification', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    source: varchar('source', { length: 50 }).notNull(),
    currencyId: bigint('currency_id', { mode: 'number' })
        .notNull()
        .references(() => currency.id, { onDelete: 'restrict' }),
    merchantId: varchar('merchant_id', { length: 20 }).notNull(),
    merchantPhone: varchar('merchant_phone', { length: 15 }).notNull(),
    issuerPhone: varchar('issuer_phone', { length: 15 }).notNull(),
    description: varchar('description', { length: 100 }),
    issuingBank: varchar('issuing_bank', { length: 10 }).notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    reference: varchar('reference', { length: 50 }).notNull(),
    networkCode: varchar('network_code', { length: 2 }).notNull(),
    originalPayload: jsonb('original_payload').notNull(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const transaction = pgTable('transaction', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    bookingId: bigint('booking_id', { mode: 'number' }).references(() => booking.id, { onDelete: 'set null' }),
    paymentId: bigint('payment_id', { mode: 'number' }).references(() => payment.id, { onDelete: 'set null' }),
    hostId: bigint('host_id', { mode: 'number' }).references(() => host.id),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    exchangeRate: numeric('exchange_rate', {
        precision: 18,
        scale: 6,
    }).notNull(),
    amountConverted: bigint('amount_converted', { mode: 'number' }).notNull(),
    typeId: bigint('type_id', { mode: 'number' })
        .notNull()
        .references(() => transactionType.id, { onDelete: 'restrict' }),
    direction: varchar('direction', { length: 10 }).notNull(),
    statusId: bigint('status_id', { mode: 'number' })
        .notNull()
        .references(() => status.id),
    reference: varchar('reference', { length: 100 }),
    bankNotificationId: bigint('bank_notification_id', {
        mode: 'number',
    }).references(() => bankNotification.id, { onDelete: 'set null' }),
    description: varchar('description', { length: 500 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const transactionSplit = pgTable('transaction_split', {
    id: serial('id').primaryKey(),
    transactionId: bigint('transaction_id', { mode: 'number' })
        .notNull()
        .references(() => transaction.id, { onDelete: 'cascade' }),
    beneficiaryType: varchar('beneficiary_type', { length: 50 }).notNull(),
    beneficiaryId: bigint('beneficiary_id', { mode: 'number' }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    exchangeRate: numeric('exchange_rate', {
        precision: 18,
        scale: 6,
    }).notNull(),
    amountConverted: bigint('amount_converted', { mode: 'number' }).notNull(),
    share: decimal('share', { precision: 5, scale: 2 }),
    statusId: bigint('status_id', { mode: 'number' })
        .notNull()
        .references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
