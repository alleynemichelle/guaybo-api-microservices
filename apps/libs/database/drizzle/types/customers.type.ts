import { customer, host, appUser } from '../schemas';

export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;

export type CustomerWithDetails = Customer & {
    user: typeof appUser.$inferSelect | null;
    host: typeof host.$inferSelect | null;
};
