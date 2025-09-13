import { v4 as uuidv4 } from 'uuid';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { Status } from 'apps/libs/common/enums/status.enum';

import { Base } from '../common/base.entity';

export enum ReferralEntityType {
    USER = 'USER',
    HOST = 'HOST',
}

export class ReferralAssociation extends Base {
    @IsString()
    @IsNotEmpty()
    referrerId: string;

    @IsString()
    @IsNotEmpty()
    referredEntityId: string; // userId or hostId

    @IsEnum(ReferralEntityType)
    @IsNotEmpty()
    entityType: ReferralEntityType;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsOptional()
    @IsString()
    utmSource?: string;

    @IsDateString()
    @IsNotEmpty()
    createdAt: string;

    @IsDateString()
    @IsNotEmpty()
    updatedAt: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    until?: string;

    constructor(referralAssociation: Partial<ReferralAssociation>) {
        super();

        this.recordId = referralAssociation.recordId || uuidv4();
        this.recordType = `${DatabaseKeys.REFERRER}#${referralAssociation.code}`;
        this.recordStatus = referralAssociation.recordStatus || Status.ACTIVE;
        this.referrerId = referralAssociation.referrerId!;
        this.referredEntityId = referralAssociation.referredEntityId!;
        this.entityType = referralAssociation.entityType || ReferralEntityType.USER;
        this.code = referralAssociation.code!;
        this.utmSource = referralAssociation.utmSource;
        this.recordStatus = referralAssociation.recordStatus || Status.ACTIVE;
        this.createdAt = referralAssociation.createdAt || getUTCDate().toISOString();
        this.updatedAt = referralAssociation.updatedAt || getUTCDate().toISOString();
        this.from = referralAssociation.from;
        this.until = referralAssociation.until;
    }
}
