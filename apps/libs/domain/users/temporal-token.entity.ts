import { v4 as uuidv4 } from 'uuid';
import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsOptional, IsEnum } from 'class-validator';

import { Base } from '../common/base.entity';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';

/**
 * Entity for storing temporal tokens in database
 */
export class TemporalToken extends Base {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsEnum(TemporalTokenType)
    tokenType: TemporalTokenType;

    @IsOptional()
    @IsString()
    redirectUrl?: string;

    @IsNotEmpty()
    @IsString()
    expiresAt: string;

    @IsNotEmpty()
    @IsBoolean()
    used: boolean;

    constructor(data: Partial<TemporalToken>) {
        super();
        Object.assign(this, data);

        this.recordId = data.recordId ?? uuidv4();
        this.email = data.email?.trim().toLowerCase() || '';
        this.alias = this.email;
        this.createdAt = data.createdAt ?? getUTCDate().toISOString();
        this.updatedAt = data.updatedAt ?? getUTCDate().toISOString();
        this.recordType = data.recordType ?? DatabaseKeys.TEMPORAL_TOKEN;
        this.used = data.used ?? false;
    }
}
