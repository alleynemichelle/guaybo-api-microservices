import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { appUser, customer, host, hostBillingDiscount, hostUser, role, status } from '../schemas';

export type AppUser = InferSelectModel<typeof appUser>;
export type NewAppUser = InferInsertModel<typeof appUser>;

export type HostBillingDiscount = InferSelectModel<typeof hostBillingDiscount>;
export type NewHostBillingDiscount = InferInsertModel<typeof hostBillingDiscount>;

export type AppUserWithStatus = typeof appUser.$inferSelect & {
    status: typeof status.$inferSelect | null;
};

export type AppUserWithHosts = typeof appUser.$inferSelect & {
    status: typeof status.$inferSelect | null;
    hostUsers: typeof hostUser.$inferSelect &
        {
            host: typeof host.$inferSelect;
            status: typeof status.$inferSelect | null;
            role: typeof role.$inferSelect;
        }[];
};
