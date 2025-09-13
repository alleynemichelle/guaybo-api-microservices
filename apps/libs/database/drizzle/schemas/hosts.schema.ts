import {
    bigint,
    boolean,
    decimal,
    integer,
    jsonb,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { billingPlan } from './billing.schema';
import { multimedia, role, status } from './common.schema';
import { coProducer, product } from './products.schema';
import { appUser, customer, hostBillingDiscount } from './users.schema';

export const host = pgTable('host', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    billingPlanId: bigint('billing_plan_id', { mode: 'number' })
        .notNull()
        .references(() => billingPlan.id),
    commissionPayer: varchar('commission_payer', { length: 50 }).notNull().default('HOST'),
    name: varchar('name', { length: 255 }).notNull(),
    alias: varchar('alias', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull(),
    collectionId: varchar('collection_id', { length: 255 }),
    description: varchar('description', { length: 1000 }),
    phoneCode: varchar('phone_code', { length: 10 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    timezone: varchar('timezone', { length: 100 }),
    verified: boolean('verified').default(false),
    rating: decimal('rating', { precision: 5, scale: 0 }),
    reviews: integer('reviews'),
    yearsExperience: integer('years_experience'),
    tags: jsonb('tags'),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    verificationStatusId: bigint('verification_status_id', {
        mode: 'number',
    }).references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const hostRelations = relations(host, ({ one, many }) => ({
    billingPlan: one(billingPlan, {
        fields: [host.billingPlanId],
        references: [billingPlan.id],
    }),
    status: one(status, {
        fields: [host.statusId],
        references: [status.id],
    }),
    verificationStatus: one(status, {
        fields: [host.verificationStatusId],
        references: [status.id],
    }),
    multimedia: many(multimedia),
    hostSocialMedia: many(hostSocialMedia),
    hostAnalytics: many(hostAnalytics),
    hostUsers: many(hostUser),
    customers: many(customer),
    hostBillingDiscounts: many(hostBillingDiscount),
    products: many(product),
    coProducerEntries: many(coProducer),
}));

export const hostSocialMedia = pgTable(
    'host_social_media',
    {
        id: serial('id').primaryKey(),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        platform: varchar('platform', { length: 50 }).notNull(),
        username: varchar('username', { length: 255 }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    },
    (table) => {
        return {
            hostPlatformUsernameUnique: unique('host_social_media_host_id_platform_username_unique').on(
                table.hostId,
                table.platform,
                table.username,
            ),
        };
    },
);

export const hostSocialMediaRelations = relations(hostSocialMedia, ({ one }) => ({
    host: one(host, {
        fields: [hostSocialMedia.hostId],
        references: [host.id],
    }),
    status: one(status, {
        fields: [hostSocialMedia.statusId],
        references: [status.id],
    }),
}));

export const hostAnalytics = pgTable(
    'host_analytics',
    {
        id: serial('id').primaryKey(),
        recordId: uuid('record_id').defaultRandom().notNull().unique(),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        provider: varchar('provider', { length: 50 }).notNull(),
        trackerId: varchar('tracker_id', { length: 255 }).notNull(),
        trackerName: varchar('tracker_name', { length: 255 }),
        configuration: jsonb('configuration'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    },
    (table) => {
        return {
            hostProviderTrackerUnique: unique('host_analytics_host_id_provider_tracker_id_unique').on(
                table.hostId,
                table.provider,
                table.trackerId,
            ),
        };
    },
);

export const hostAnalyticsRelations = relations(hostAnalytics, ({ one }) => ({
    host: one(host, {
        fields: [hostAnalytics.hostId],
        references: [host.id],
    }),
    status: one(status, {
        fields: [hostAnalytics.statusId],
        references: [status.id],
    }),
}));

export const hostUser = pgTable(
    'host_user',
    {
        id: serial('id').primaryKey(),
        hostId: bigint('host_id', { mode: 'number' })
            .notNull()
            .references(() => host.id, { onDelete: 'cascade' }),
        userId: bigint('user_id', { mode: 'number' })
            .notNull()
            .references(() => appUser.id, { onDelete: 'cascade' }),
        roleId: bigint('role_id', { mode: 'number' })
            .notNull()
            .references(() => role.id, { onDelete: 'restrict' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    },
    (table) => {
        return {
            hostUserUnique: unique('host_user_host_id_user_id_unique').on(table.hostId, table.userId),
        };
    },
);

export const hostUserRelations = relations(hostUser, ({ one }) => ({
    host: one(host, {
        fields: [hostUser.hostId],
        references: [host.id],
    }),
    user: one(appUser, {
        fields: [hostUser.userId],
        references: [appUser.id],
    }),
    role: one(role, {
        fields: [hostUser.roleId],
        references: [role.id],
    }),
    status: one(status, {
        fields: [hostUser.statusId],
        references: [status.id],
    }),
}));
