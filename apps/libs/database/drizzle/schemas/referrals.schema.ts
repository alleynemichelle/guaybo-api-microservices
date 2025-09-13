import { bigint, decimal, integer, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { status } from './common.schema';
import { appUser } from './users.schema';

export const referralCode = pgTable('referral_code', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    referrerId: bigint('referrer_id', { mode: 'number' })
        .notNull()
        .references(() => appUser.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull().unique(),
    referralRate: decimal('referral_rate', {
        precision: 5,
        scale: 2,
    }).notNull(),
    durationDays: integer('duration_days'),
    capMinor: bigint('cap_minor', { mode: 'number' }),
    windowDays: integer('window_days'),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const referralCodeRelations = relations(referralCode, ({ one, many }) => ({
    referrer: one(appUser, {
        fields: [referralCode.referrerId],
        references: [appUser.id],
    }),
    status: one(status, {
        fields: [referralCode.statusId],
        references: [status.id],
    }),
    referralAssociations: many(referralAssociation),
}));

export const referralAssociation = pgTable('referral_association', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    referrerId: bigint('referrer_id', { mode: 'number' })
        .notNull()
        .references(() => appUser.id, { onDelete: 'cascade' }),
    referredId: bigint('referred_id', { mode: 'number' })
        .notNull()
        .references(() => appUser.id, { onDelete: 'cascade' }),
    utmSource: varchar('utm_source', { length: 255 }),
    referralCodeId: bigint('referral_code_id', { mode: 'number' }).references(() => referralCode.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const referralAssociationRelations = relations(referralAssociation, ({ one }) => ({
    referrer: one(appUser, {
        fields: [referralAssociation.referrerId],
        references: [appUser.id],
    }),
    referred: one(appUser, {
        fields: [referralAssociation.referredId],
        references: [appUser.id],
    }),
    referralCode: one(referralCode, {
        fields: [referralAssociation.referralCodeId],
        references: [referralCode.id],
    }),
}));
