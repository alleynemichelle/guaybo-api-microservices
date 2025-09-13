import { bigint, integer, jsonb, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { status } from './common.schema';

export const discount = pgTable('discount', {
    id: serial('id').primaryKey(),
    recordId: bigint('record_id', { mode: 'number' }).notNull().unique(),
    ownerType: varchar('owner_type', { length: 50 }).notNull().default('APP'),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1000 }),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'PERCENTAGE', 'FIXED'
    scope: varchar('scope', { length: 50 }).notNull(), // 'TOTAL', 'ITEM'
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    code: varchar('code', { length: 100 }),
    maxCapacity: integer('max_capacity'),
    durationQuantity: integer('duration_quantity'),
    durationUnit: varchar('duration_unit', { length: 50 }),
    conditions: jsonb('conditions'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const discountRelations = relations(discount, ({ one }) => ({
    status: one(status, {
        fields: [discount.statusId],
        references: [status.id],
    }),
}));

export const billingPlan = pgTable('billing_plan', {
    id: serial('id').primaryKey(),
    recordId: uuid('record_id').defaultRandom().notNull().unique(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    description: varchar('description', { length: 1000 }),
    features: jsonb('features'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    statusId: bigint('status_id', { mode: 'number' }).references(() => status.id),
});

export const billingPlanRelations = relations(billingPlan, ({ one, many }) => ({
    status: one(status, {
        fields: [billingPlan.statusId],
        references: [status.id],
    }),
    planBreakdowns: many(planBreakdown),
}));

export const planBreakdown = pgTable('plan_breakdown', {
    id: serial('id').primaryKey(),
    billingPlanId: bigint('billing_plan_id', { mode: 'number' })
        .notNull()
        .references(() => billingPlan.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
});

export const planBreakdownRelations = relations(planBreakdown, ({ one }) => ({
    billingPlan: one(billingPlan, {
        fields: [planBreakdown.billingPlanId],
        references: [billingPlan.id],
    }),
}));
