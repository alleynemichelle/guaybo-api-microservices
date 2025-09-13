import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    bankNotification,
    installment,
    payment,
    paymentOption,
    transaction,
    transactionSplit,
    status,
    paymentMethod,
    currency,
} from '../schemas';

export type PaymentOption = InferSelectModel<typeof paymentOption>;
export type NewPaymentOption = InferInsertModel<typeof paymentOption>;

export type Payment = InferSelectModel<typeof payment>;
export type NewPayment = InferInsertModel<typeof payment>;

export type Installment = InferSelectModel<typeof installment>;
export type NewInstallment = InferInsertModel<typeof installment>;

export type BankNotification = InferSelectModel<typeof bankNotification>;
export type NewBankNotification = InferInsertModel<typeof bankNotification>;

export type Transaction = InferSelectModel<typeof transaction>;
export type NewTransaction = InferInsertModel<typeof transaction>;

export type TransactionSplit = InferSelectModel<typeof transactionSplit>;
export type NewTransactionSplit = InferInsertModel<typeof transactionSplit>;

export type PaymentOptionWithMethod = typeof paymentOption.$inferSelect & {
    status: typeof status.$inferSelect | null;
    paymentMethod: typeof paymentMethod.$inferSelect & { currency: typeof currency.$inferSelect };
};
