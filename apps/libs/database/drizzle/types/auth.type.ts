import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { appUser, confirmationCode, status, temporalToken } from '../schemas';

export type TemporalToken = InferSelectModel<typeof temporalToken>;
export type NewTemporalToken = InferInsertModel<typeof temporalToken>;

export type ConfirmationCode = InferSelectModel<typeof confirmationCode>;
export type NewConfirmationCode = InferInsertModel<typeof confirmationCode>;

export type ConfirmationCodeWithStatus = ConfirmationCode & {
    status: typeof status.$inferSelect | null;
};

export type TemporalTokenWithUser = TemporalToken & {
    user: typeof appUser.$inferSelect | null;
};
