import { pgTable, bigint, varchar, jsonb, timestamp, serial } from 'drizzle-orm/pg-core';
import { status } from './common.schema';

export const appSettings = pgTable('app_settings', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: jsonb('value'),
    description: varchar('description', { length: 255 }),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
