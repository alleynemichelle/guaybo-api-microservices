import { bigint, boolean, integer, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { host } from './hosts.schema';
import { appUser } from './users.schema';

export const status = pgTable('status', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productType = pgTable('product_type', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const availabilityType = pgTable('availability_type', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const meetingPlatform = pgTable('meeting_platform', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const transactionType = pgTable('transaction_type', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const transactionDirection = pgTable('transaction_direction', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 10 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const beneficiaryType = pgTable('beneficiary_type', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const productResourceType = pgTable('product_resource_type', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const questionType = pgTable('question_type', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
});

export const currency = pgTable('currency', {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 10 }).notNull().unique(),
    symbol: varchar('symbol', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const role = pgTable('role', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const paymentMethod = pgTable('payment_method', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(),
    icon: varchar('icon', { length: 50 }),
    requiresCoordination: boolean('requires_coordination').default(false),
    automatic: boolean('automatic').default(false),
    currencyId: bigint('currency_id', { mode: 'number' })
        .notNull()
        .references(() => currency.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const paymentMethodRelations = relations(paymentMethod, ({ one }) => ({
    currency: one(currency, {
        fields: [paymentMethod.currencyId],
        references: [currency.id],
    }),
    status: one(status, {
        fields: [paymentMethod.statusId],
        references: [status.id],
    }),
}));

export const multimedia = pgTable('multimedia', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    hostId: bigint('host_id', { mode: 'number' }).references(() => host.id, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    source: varchar('source', { length: 50 }).notNull(),
    filename: varchar('filename', { length: 500 }),
    path: varchar('path', { length: 1000 }),
    description: varchar('description', { length: 1000 }),
    usageType: varchar('usage_type', { length: 50 }),
    orderIndex: integer('order_index'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const multimediaRelations = relations(multimedia, ({ one }) => ({
    host: one(host, {
        fields: [multimedia.hostId],
        references: [host.id],
    }),
    user: one(appUser, {
        fields: [multimedia.userId],
        references: [appUser.id],
    }),
    status: one(status, {
        fields: [multimedia.statusId],
        references: [status.id],
    }),
}));
