import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { referralAssociation, referralCode, appUser, status } from '../schemas';

export type ReferralCode = InferSelectModel<typeof referralCode>;
export type NewReferralCode = InferInsertModel<typeof referralCode>;

export type ReferralAssociation = InferSelectModel<typeof referralAssociation>;
export type NewReferralAssociation = InferInsertModel<typeof referralAssociation>;

export type ReferralCodeWithStatus = typeof referralCode.$inferSelect & {
    status: typeof status.$inferSelect | null;
};

export type ReferralAssociationWithRelations = typeof referralAssociation.$inferSelect & {
    referrer: typeof appUser.$inferSelect;
    referred: typeof appUser.$inferSelect;
    referralCode: ReferralCodeWithStatus | null;
};

export type ReferredUser = {
    id: number | null;
    recordId: string | null;
    email: string | null;
    isHost: boolean | null;
    utmSource: string | null;
    createdAt: Date;
    referralCode: string | null;
};
