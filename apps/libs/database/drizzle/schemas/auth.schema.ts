import { bigint, boolean, integer, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { status } from './common.schema';
import { appUser } from './users.schema';

export const temporalToken = pgTable('temporal_token', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    userId: bigint('user_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'cascade' }),
    tokenType: varchar('token_type', { length: 50 }).notNull(),
    redirectUrl: varchar('redirect_url', { length: 1000 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    used: boolean('used').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const temporalTokenRelations = relations(temporalToken, ({ one }) => ({
    user: one(appUser, {
        fields: [temporalToken.userId],
        references: [appUser.id],
    }),
}));

export const confirmationCode = pgTable('confirmation_code', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    userId: bigint('user_id', { mode: 'number' })
        .notNull()
        .references(() => appUser.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 20 }).notNull(),
    codeType: varchar('code_type', { length: 50 }).notNull(),
    statusId: bigint('status_id', { mode: 'number' })
        .notNull()
        .references(() => status.id),
    ttl: integer('ttl').notNull(),
    redirectType: varchar('redirect_type', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const confirmationCodeRelations = relations(confirmationCode, ({ one }) => ({
    status: one(status, {
        fields: [confirmationCode.statusId],
        references: [status.id],
    }),
    user: one(appUser, {
        fields: [confirmationCode.userId],
        references: [appUser.id],
    }),
}));
