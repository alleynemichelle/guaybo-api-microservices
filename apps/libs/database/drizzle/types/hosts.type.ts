import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    billingPlan,
    discount,
    host,
    hostAnalytics,
    hostBillingDiscount,
    hostSocialMedia,
    hostUser,
    multimedia,
    planBreakdown,
    status,
} from '../schemas';

export type Host = typeof host.$inferSelect;
export type NewHost = typeof host.$inferInsert;

export type HostAnalytics = typeof hostAnalytics.$inferSelect;
export type NewHostAnalytics = typeof hostAnalytics.$inferInsert;

export type HostSocialMedia = InferSelectModel<typeof hostSocialMedia>;
export type NewHostSocialMedia = InferInsertModel<typeof hostSocialMedia>;

export type HostUser = InferSelectModel<typeof hostUser>;
export type NewHostUser = InferInsertModel<typeof hostUser>;

export type HostAnalyticsWithStatus = HostAnalytics & {
    status: typeof status.$inferSelect | null;
};

export type HostWithLogoAndStatus = Host & {
    status: typeof status.$inferSelect | null;
    verificationStatus: typeof status.$inferSelect | null;
    multimedia: (typeof multimedia.$inferSelect)[];
};

export type HostWithDetails = Host & {
    status: typeof status.$inferSelect | null;
    verificationStatus: typeof status.$inferSelect | null;
    multimedia: (typeof multimedia.$inferSelect)[];
    billingPlan:
        | (typeof billingPlan.$inferSelect & {
              planBreakdowns: (typeof planBreakdown.$inferSelect)[];
          })
        | null;
    hostBillingDiscounts: (typeof hostBillingDiscount.$inferSelect & {
        status: typeof status.$inferSelect | null;
        discount:
            | (typeof discount.$inferSelect & {
                  status: typeof status.$inferSelect | null;
              })
            | null;
    })[];
};
