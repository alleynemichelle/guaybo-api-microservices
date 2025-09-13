import { v4 as uuidv4 } from 'uuid';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { Status } from 'apps/libs/common/enums/status.enum';

import { Base } from '../common/base.entity';

export class ReferralCode extends Base {
    @IsString()
    @IsNotEmpty()
    referrerId: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumber()
    @Min(1)
    @Max(100)
    referralRate: number; // (2%)

    @IsOptional()
    @IsNumber()
    @Min(1)
    durationDays?: number; // Duration of the referral association once created (how long the referral relationship exists)

    @IsOptional()
    @IsNumber()
    @Min(0)
    capMinor?: number; // Optional, maximum amount in minor currency unit

    @IsOptional()
    @IsNumber()
    @Min(0)
    windowDays?: number; // Time window during which commissions can be earned from the referral (from association creation)

    @IsDateString()
    @IsNotEmpty()
    createdAt: string;

    @IsDateString()
    @IsNotEmpty()
    updatedAt: string;

    constructor(referralCode: Partial<ReferralCode>) {
        super();

        this.recordId = referralCode.recordId || uuidv4();
        this.recordType = DatabaseKeys.REFERRAL_CODE;
        this.recordStatus = referralCode.recordStatus || Status.ACTIVE;
        this.code = referralCode.code || '';
        this.referralRate = referralCode.referralRate || 0;
        this.durationDays = referralCode.durationDays || 0;
        this.capMinor = referralCode.capMinor || 0;
        this.windowDays = referralCode.windowDays || 0;
        this.createdAt = referralCode.createdAt || getUTCDate().toISOString();
        this.updatedAt = referralCode.updatedAt || getUTCDate().toISOString();
    }
}
