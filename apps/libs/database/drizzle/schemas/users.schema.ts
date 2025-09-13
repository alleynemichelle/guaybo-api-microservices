import {
    bigint,
    boolean,
    integer,
    jsonb,
    pgTable,
    serial,
    timestamp,
    unique,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { discount } from './billing.schema';
import { multimedia, status } from './common.schema';
import { paymentOption } from './payments.schema';
import { kycIdentity, kycSession } from './kyc.schema';
import { referralAssociation, referralCode } from './referrals.schema';
import { coProducer } from './products.schema';
import { host, hostUser } from './hosts.schema';

export const appUser = pgTable('app_user', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    fullName: varchar('full_name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    instagramAccount: varchar('instagram_account', { length: 255 }),
    federated: boolean('federated').default(false),
    registered: boolean('registered').default(false),
    verifiedEmail: boolean('verified_email').default(false),
    phoneCode: varchar('phone_code', { length: 10 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    timezone: varchar('timezone', { length: 100 }),
    lastAccess: timestamp('last_access', { withTimezone: true }).defaultNow(),
    defaultLanguage: varchar('default_language', { length: 20 }).default('ES'),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    isHost: boolean('is_host').default(false),
    isReferrer: boolean('is_referrer').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const appUserRelations = relations(appUser, ({ one, many }) => ({
    status: one(status, {
        fields: [appUser.statusId],
        references: [status.id],
    }),
    multimedia: many(multimedia),
    hostUsers: many(hostUser),
    customers: many(customer),
    paymentOptions: many(paymentOption),
    kycSessions: many(kycSession),
    kycIdentity: one(kycIdentity),
    referralCodes: many(referralCode),
    referredAssociations: many(referralAssociation, { relationName: 'referred' }),
    referrerAssociations: many(referralAssociation, { relationName: 'referrer' }),
    coProducerEntries: many(coProducer),
}));

export const customer = pgTable(
    'customer',
    {
        id: serial('id').primaryKey(),
        recordId: uuid('record_id').defaultRandom().notNull().unique(),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        userId: bigint('user_id', { mode: 'number' })
            .notNull()
            .references(() => appUser.id, { onDelete: 'cascade' }),
        totalBookings: integer('total_bookings').default(0),
        tags: jsonb('tags'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return {
            hostUserUnique: unique('customer_host_id_user_id_unique').on(table.hostId, table.userId),
        };
    },
);

export const customerRelations = relations(customer, ({ one }) => ({
    host: one(host, {
        fields: [customer.hostId],
        references: [host.id],
    }),
    user: one(appUser, {
        fields: [customer.userId],
        references: [appUser.id],
    }),
}));

export const hostBillingDiscount = pgTable(
    'host_billing_discount',
    {
        id: serial('id').primaryKey(),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        discountId: bigint('discount_id', { mode: 'number' })
            .notNull()
            .references(() => discount.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
        validFrom: timestamp('valid_from', { withTimezone: true }),
        validUntil: timestamp('valid_until', { withTimezone: true }),
    },
    (table) => {
        return {
            hostDiscountUnique: unique('host_billing_discount_host_id_discount_id_unique').on(
                table.hostId,
                table.discountId,
            ),
        };
    },
);

export const hostBillingDiscountRelations = relations(hostBillingDiscount, ({ one }) => ({
    host: one(host, {
        fields: [hostBillingDiscount.hostId],
        references: [host.id],
    }),
    discount: one(discount, {
        fields: [hostBillingDiscount.discountId],
        references: [discount.id],
    }),
    status: one(status, {
        fields: [hostBillingDiscount.statusId],
        references: [status.id],
    }),
}));
