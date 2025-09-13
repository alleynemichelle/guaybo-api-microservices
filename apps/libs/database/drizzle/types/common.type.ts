import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    availabilityType,
    beneficiaryType,
    currency,
    meetingPlatform,
    multimedia,
    paymentMethod,
    productResourceType,
    productType,
    questionType,
    role,
    status,
    transactionDirection,
    transactionType,
} from '../schemas';

export type Status = InferSelectModel<typeof status>;
export type NewStatus = InferInsertModel<typeof status>;

export type ProductType = InferSelectModel<typeof productType>;
export type NewProductType = InferInsertModel<typeof productType>;

export type AvailabilityType = InferSelectModel<typeof availabilityType>;
export type NewAvailabilityType = InferInsertModel<typeof availabilityType>;

export type MeetingPlatform = InferSelectModel<typeof meetingPlatform>;
export type NewMeetingPlatform = InferInsertModel<typeof meetingPlatform>;

export type TransactionType = InferSelectModel<typeof transactionType>;
export type NewTransactionType = InferInsertModel<typeof transactionType>;

export type TransactionDirection = InferSelectModel<typeof transactionDirection>;
export type NewTransactionDirection = InferInsertModel<typeof transactionDirection>;

export type BeneficiaryType = InferSelectModel<typeof beneficiaryType>;
export type NewBeneficiaryType = InferInsertModel<typeof beneficiaryType>;

export type ProductResourceType = InferSelectModel<typeof productResourceType>;
export type NewProductResourceType = InferInsertModel<typeof productResourceType>;

export type QuestionType = InferSelectModel<typeof questionType>;
export type NewQuestionType = InferInsertModel<typeof questionType>;

export type Currency = InferSelectModel<typeof currency>;
export type NewCurrency = InferInsertModel<typeof currency>;

export type Role = InferSelectModel<typeof role>;
export type NewRole = InferInsertModel<typeof role>;

export type PaymentMethod = InferSelectModel<typeof paymentMethod>;
export type NewPaymentMethod = InferInsertModel<typeof paymentMethod>;

export type Multimedia = InferSelectModel<typeof multimedia>;
export type NewMultimedia = InferInsertModel<typeof multimedia>;
