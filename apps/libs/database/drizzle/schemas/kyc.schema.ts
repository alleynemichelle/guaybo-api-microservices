import { bigint, date, integer, jsonb, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { status } from './common.schema';
import { appUser } from './users.schema';

export const kycSession = pgTable('kyc_session', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    userId: bigint('user_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').notNull(),
    sessionNumber: integer('session_number').notNull(),
    sessionToken: varchar('session_token', { length: 255 }).notNull(),
    vendorData: varchar('vendor_data', { length: 255 }),
    metadata: jsonb('metadata'),
    statusId: bigint('status_id', { mode: 'number' })
        .notNull()
        .references(() => status.id),
    workflowId: uuid('workflow_id').notNull(),
    callbackUrl: varchar('callback_url', { length: 1000 }).notNull(),
    verificationUrl: varchar('verification_url', { length: 1000 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const kycSessionRelations = relations(kycSession, ({ one }) => ({
    user: one(appUser, {
        fields: [kycSession.userId],
        references: [appUser.id],
    }),
    status: one(status, {
        fields: [kycSession.statusId],
        references: [status.id],
    }),
}));

export const kycIdentity = pgTable('kyc_identity', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    userId: bigint('user_id', { mode: 'number' }).references(() => appUser.id, { onDelete: 'cascade' }),
    personType: varchar('person_type', { length: 50 }).notNull().default('NATURAL'),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    fullName: varchar('full_name', { length: 500 }),
    gender: varchar('gender', { length: 20 }),
    age: integer('age'),
    dateOfBirth: date('date_of_birth'),
    maritalStatus: varchar('marital_status', { length: 50 }),
    nationality: varchar('nationality', { length: 100 }),
    placeOfBirth: varchar('place_of_birth', { length: 255 }),
    documentNumber: varchar('document_number', { length: 100 }).notNull(),
    documentType: varchar('document_type', { length: 100 }),
    issuingState: varchar('issuing_state', { length: 10 }),
    issuingStateName: varchar('issuing_state_name', { length: 255 }),
    dateOfIssue: date('date_of_issue'),
    expirationDate: date('expiration_date'),
    portraitImage: text('portrait_image'),
    frontImage: text('front_image'),
    backImage: text('back_image'),
    frontVideo: text('front_video'),
    backVideo: text('back_video'),
    fullFrontImage: text('full_front_image'),
    fullBackImage: text('full_back_image'),
    address: text('address'),
    formattedAddress: text('formatted_address'),
    parsedAddress: text('parsed_address'),
    extraFields: jsonb('extra_fields'),
    extraFiles: jsonb('extra_files'),
    sessionId: uuid('session_id'),
    statusId: bigint('status_id', { mode: 'number' })
        .notNull()
        .references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const kycIdentityRelations = relations(kycIdentity, ({ one }) => ({
    user: one(appUser, {
        fields: [kycIdentity.userId],
        references: [appUser.id],
    }),
    status: one(status, {
        fields: [kycIdentity.statusId],
        references: [status.id],
    }),
}));
