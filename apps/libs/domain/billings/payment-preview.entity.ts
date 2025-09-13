import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString, IsUUID, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Breakdown } from './breakdown.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Base } from '../common/base.entity';
import { ConversionRate } from '../bookings/conversion-rate.entity';

export class TotalItemDto {
    @IsString()
    currency: string;

    @IsNumber()
    amount: number;
}

export class PaymentPreview extends Base {
    @IsString()
    hostId: string;

    @IsString()
    invoiceId: string;

    @IsString()
    invoiceNumber: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Breakdown)
    breakdown: Breakdown[];

    @ValidateNested()
    @Type(() => InvoiceItem)
    interests: InvoiceItem;

    @IsNumber()
    subtotal: number;

    @IsNumber()
    billingTotal: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TotalItemDto)
    total: TotalItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConversionRate)
    conversionRates?: ConversionRate[];

    @IsOptional()
    @ValidateNested()
    @Type(() => InvoiceItem)
    discounts?: InvoiceItem;
}
