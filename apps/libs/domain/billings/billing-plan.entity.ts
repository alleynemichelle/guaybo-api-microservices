import { IsArray, IsDateString, IsEnum, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Unit } from 'apps/libs/common/enums/unit.enum';
import { BillingType } from 'apps/libs/common/enums/billing-model.enum';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';

import { Discount } from '../bookings/discount.entity';
import { Breakdown } from './breakdown.entity';
import { Base } from '../common/base.entity';

export class FreeTrial {
    @IsNumber()
    quantity: number;

    @IsEnum(Unit)
    unit: Unit;

    @IsDateString()
    validFrom: string;

    @IsDateString()
    validUntil: string;
}

export class BillingPlan extends Base {
    @IsUUID()
    recordId: string;

    @IsString()
    key: string;

    @IsEnum(BillingType)
    billingType: BillingType;

    @IsEnum(CommissionPayer)
    commissionPayer: CommissionPayer;

    @ValidateNested()
    @Type(() => FreeTrial)
    trialPeriod?: FreeTrial;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discount)
    discounts?: Discount[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Breakdown)
    breakdown: Breakdown[];

    @IsArray()
    @IsString({ each: true })
    features: string[];
}
