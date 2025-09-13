import { IsArray, IsEnum, IsString, IsUUID, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';

import { Base } from '../common/base.entity';
import { ConversionRate } from './conversion-rate.entity';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';

export class Payment extends Base {
    @IsNumber()
    amount: number;

    @IsString()
    bookingId: string;

    @IsArray()
    conversionRates?: ConversionRate[];

    @IsUUID()
    customerId: string;

    @IsEnum(Currency)
    currency?: Currency;

    @IsUUID()
    userId: string;

    @IsUUID()
    hostId: string;

    @IsDateString()
    paymentDate: string;

    @IsString()
    paymentMethodId?: string;

    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsString()
    paymentReceipt?: string;

    @IsEnum(PaymentStatus)
    paymentStatus: PaymentStatus;

    @IsUUID()
    planId: string;

    @IsString()
    referenceCode?: string;

    @IsBoolean()
    requiresCoordination: boolean;

    @IsUUID()
    productId: string;

    @IsString()
    dateId?: string;

    @IsArray()
    @IsString({ each: true })
    installments?: string[];
}
