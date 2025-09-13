import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { appSettings } from '../schemas';

export type AppSettings = InferSelectModel<typeof appSettings>;
export type NewAppSettings = InferInsertModel<typeof appSettings>;
