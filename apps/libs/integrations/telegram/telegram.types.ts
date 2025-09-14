import { TelegramTemplate } from '../../common/enums/telegram-template.enum';

export enum TelegramChatId {
    GLOBAL = '-1002532686177',
    FREE_BOOKINGS = '-1002296643850',
    PAID_BOOKINGS = '-4920746520',
}

export type TemplateType = TelegramTemplate;

export interface TemplateData {
    createdAt?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    federated?: string | boolean;
    hostId?: string;
    hostAlias?: string;
    productName?: string;
    productAlias?: string;
    productType?: string;
    bookingId?: string;
    bookingTotal?: number;
    isTest?: boolean | string | undefined;
    isPaid?: boolean | string | undefined;
    bookingCommission?: number;
    bookingCommissionPayer?: string;
    clientName?: string;
    clientEmail?: string;
    invoiceId?: string;
    invoiceTotal?: number;
}
