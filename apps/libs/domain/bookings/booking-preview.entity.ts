import { IsArray, IsBoolean, IsDateString, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';

import { ConversionRate } from './conversion-rate.entity';
import { Discount } from './discount.entity';

class Installment {
    @IsNumber()
    amount: number;

    @IsDateString()
    dueDate: string;

    @IsNumber()
    order: number;
}

export class BookingPreview {
    @IsArray()
    conversionRates?: ConversionRate[];

    @IsNumber()
    discountedAmount: number;

    @IsArray()
    discounts: Discount[];

    @IsBoolean()
    installmentsProgramApplied: boolean;

    @IsObject()
    appFee: {
        commissionPayer: CommissionPayer;
        amount: number;
    };

    @IsArray()
    items: Array<{
        discounts: Array<Discount>;
        fareType: string;
        finalPrice: number;
        price: number;
        quantity: number;
        totalAmount: number;
    }>;

    @IsNumber()
    remainingAmount: number;

    @IsNumber()
    subtotal: number;

    @IsNumber()
    total: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Installment)
    installments?: Partial<Installment>[];

    @IsNumber()
    @IsOptional()
    finalAmountBeforeAppFee?: number;

    @IsNumber()
    @IsOptional()
    installmentsInterestFee?: number;

    @IsOptional()
    @IsNumber()
    amountToPay?: number;
}
