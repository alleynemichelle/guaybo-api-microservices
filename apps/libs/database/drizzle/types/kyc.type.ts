import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { kycIdentity, kycSession } from '../schemas';

export type KycSession = InferSelectModel<typeof kycSession>;
export type NewKycSession = InferInsertModel<typeof kycSession>;

export type KycIdentity = InferSelectModel<typeof kycIdentity>;
export type NewKycIdentity = InferInsertModel<typeof kycIdentity>;
