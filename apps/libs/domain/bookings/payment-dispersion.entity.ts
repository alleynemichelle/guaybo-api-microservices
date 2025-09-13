import { IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';
import { DispersionStatus } from 'apps/libs/common/enums/dispersion-status.enum';
import { DispersionType } from 'apps/libs/common/enums/dispersion-type.enum';

import { Base } from '../common/base.entity';

export class PaymentDispersion extends Base {
    @IsString()
    bookingId: string;

    @IsString()
    productId: string;

    @IsString()
    hostId: string;

    @IsString()
    paymentId: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsEnum(Currency)
    currency: Currency;

    @IsNumber()
    totalAmount: number;

    @IsNumber()
    totalAmountVES: number;

    @IsNumber()
    totalInternalCommission: number;

    @IsNumber()
    totalInternalCommissionVES: number;

    @IsNumber()
    totalHostAmount: number;

    @IsNumber()
    totalHostAmountVES: number;

    @IsEnum(CommissionPayer)
    commissionPayer: CommissionPayer;

    @IsNumber()
    totalBankInCommission: number;

    @IsNumber()
    totalBankOutCommission: number;

    @IsNumber()
    exchangeRate: number;

    @IsString()
    GSI_PK: string; // For time-based queries: "DISPERSION#{YYYY-MM}"

    @IsString()
    GSI_SK: string; // For time-based sorting: ISO timestamp

    @IsEnum(DispersionStatus)
    dispersionStatus: DispersionStatus;

    @IsEnum(DispersionType)
    dispersionType: DispersionType;
}
