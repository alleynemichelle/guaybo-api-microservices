import { v4 as uuidv4 } from 'uuid';

import {
    IsNotEmpty,
    IsEmail,
    IsString,
    IsEnum,
    IsBoolean,
    IsOptional,
    IsArray,
    IsTimeZone,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Status } from 'apps/libs/common/enums/status.enum';
import { Language } from 'apps/libs/common/enums/language.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';

import { Base } from '../common/base.entity';
import { UserHost } from './user-host.entity';
import { PhoneNumber } from '../common/phone-number.entity';

export class User extends Base {
    @IsNotEmpty()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsArray()
    hosts?: Partial<UserHost>[];

    @IsOptional()
    @IsEnum(Status, { each: true })
    status?: Status;

    @IsOptional()
    @IsEnum(Language, { each: true })
    defaultLanguage?: Language;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsBoolean()
    federated?: boolean;

    @IsOptional()
    @IsBoolean()
    registered?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    @IsOptional()
    @IsString()
    instagramAccount?: string;

    @IsOptional()
    @IsString()
    lastAccess?: string;

    @IsOptional()
    @IsTimeZone()
    timezone?: string;

    @IsOptional()
    @IsTimeZone()
    verifiedEmail: boolean;

    hostId?: string;

    isHost?: boolean;

    hashedPassword?: string;

    isReferrer?: boolean;

    constructor(user: Partial<User>) {
        super();
        Object.assign(this, user);
        const email = user.email?.trim().toLowerCase();

        this.recordId = user.recordId ?? uuidv4();
        this.alias = email;
        this.email = email || '';
        this.fullName = user.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined;
        this.createdAt = getUTCDate().toISOString();
        this.lastAccess = getUTCDate().toISOString();
        this.status = Status.ACTIVE;
        this.defaultLanguage = Language.ES;
        this.federated = user.federated ?? false;
        this.recordType = DatabaseKeys.USER;
        this.timezone = user.timezone ?? 'America/Caracas';
        this.verifiedEmail = user.verifiedEmail ?? false;
    }
}
