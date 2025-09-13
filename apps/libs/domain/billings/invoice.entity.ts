import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { getUTCDate, getYearAndMonth } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';

import { Type } from 'class-transformer';
import { Base } from '../common/base.entity';
import { Breakdown } from './breakdown.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';

export class CancelledBookingItem {
    @IsString()
    bookingId: string;

    @IsString()
    date: string;
}

export class CancelledBookings {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CancelledBookingItem)
    items: CancelledBookingItem[];

    @IsNumber()
    total: number;
}

export class PaymentDetails {
    @IsString()
    date: string;

    @IsString()
    paymentMethod: string;

    @IsString()
    receipt?: string;

    @IsString()
    referenceCode: string;
}

export class Invoice extends Base {
    @IsString()
    hostId: string;

    @IsString()
    invoiceNumber: string;

    @IsString()
    status: string;

    @IsString()
    startBillingDate: string;

    @IsString()
    closingBillingDate: string;

    @IsNumber()
    subtotal: number;

    @IsNumber()
    paidCommissions: number;

    @IsNumber()
    total?: number;

    @IsNumber()
    billingTotal: number;

    @IsBoolean()
    delayed: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Breakdown)
    breakdown: Breakdown[];

    @IsOptional()
    @Type(() => InvoiceItem)
    discounts?: InvoiceItem;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItem)
    interests?: InvoiceItem;

    @IsString()
    receipt?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => Payment)
    payment?: Partial<Payment>;

    @IsOptional()
    @ValidateNested()
    @Type(() => CancelledBookings)
    cancelledBookings?: CancelledBookings;

    constructor(invoice: Partial<Invoice>) {
        super();
        Object.assign(this, invoice);

        const { year, month } = getYearAndMonth(new Date(this.startBillingDate));
        this.recordId = `${year}${month}${generateId()}`;
        this.invoiceNumber = this.recordId;
        this.createdAt = getUTCDate().toISOString();
        this.updatedAt = getUTCDate().toISOString();
        this.recordType = DatabaseKeys.INVOICE;
    }
}
