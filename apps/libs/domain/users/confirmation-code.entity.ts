import { v4 as uuidv4 } from 'uuid';
import { IsString, IsNotEmpty, IsEmail, IsNumber, IsEnum, IsOptional } from 'class-validator';

import { Base } from '../common/base.entity';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { ConfirmationCodeStatus } from 'apps/libs/common/enums/confirmation-code-status.enum';
import { AuthRedirectType } from 'apps/libs/common/enums/auth.enum';

export class ConfirmationCode extends Base {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsNumber()
    ttl: number;

    @IsNotEmpty()
    @IsEnum(ConfirmationCodeStatus)
    codeStatus: ConfirmationCodeStatus;

    @IsNotEmpty()
    @IsString()
    codeType: string;

    @IsOptional()
    @IsString()
    redirectType?: AuthRedirectType;

    constructor(data: Partial<ConfirmationCode>) {
        super();
        Object.assign(this, data);
        const email = data.email?.trim().toLowerCase();

        this.recordId = uuidv4();
        this.email = email || '';
        this.code = data.code || '';
        this.ttl = data.ttl || 0;
        this.createdAt = getUTCDate().toISOString();
        this.updatedAt = getUTCDate().toISOString();
        this.recordType = DatabaseKeys.CONFIRMATION_CODE;
        this.codeStatus = data.codeStatus || ConfirmationCodeStatus.ACTIVE;
        this.codeType = data.codeType || '';
        this.redirectType = data.redirectType || undefined;
    }
}
