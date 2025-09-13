import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { billingPlan, discount, planBreakdown, status } from '../schemas';

export type Discount = InferSelectModel<typeof discount>;
export type NewDiscount = InferInsertModel<typeof discount>;

export type BillingPlan = InferSelectModel<typeof billingPlan>;
export type NewBillingPlan = InferInsertModel<typeof billingPlan>;

export type PlanBreakdown = InferSelectModel<typeof planBreakdown>;
export type NewPlanBreakdown = InferInsertModel<typeof planBreakdown>;

export type DiscountWithStatus = typeof discount.$inferSelect & { status: typeof status.$inferSelect | null };
