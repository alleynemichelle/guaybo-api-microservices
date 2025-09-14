import { v4 as uuidv4 } from 'uuid';

import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { cleanAlias } from 'apps/libs/common/utils/text-formatters';

import { ValueItem } from '../common/value-item.entity';
import { Location } from '../common/location.entity';
import { Item } from '../common/item.entity';
import { Base } from '../common/base.entity';
import { Multimedia } from '../common/multimedia.entity';
import { PhoneNumber } from '../common/phone-number.entity';
import { BillingPlan } from '../billings/billing-plan.entity';
import { KYCStatus } from 'apps/libs/common/enums/kyc-status.enum';
import { Logo } from '../common/logo.dto';

export class Host extends Base {
    @IsOptional()
    @IsString()
    collectionId?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    logo?: Multimedia;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsBoolean()
    verified?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => Location)
    location?: Location;

    @IsOptional()
    @ValidateNested()
    @Type(() => ValueItem)
    averageResponseTime?: ValueItem;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    keyFeatures?: Item[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    details?: Item[];

    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    @IsNumber()
    reviews?: number;

    @IsOptional()
    @IsNumber()
    yearsOfExperience?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    multimedia?: Partial<Multimedia>[];

    socialMedia?: {
        instagram?: string;
        x?: string;
        facebook?: string;
        whatsapp?: string;
        tiktok?: string;
        youtube?: string;
    };
    @IsOptional()
    @ValidateNested()
    @Type(() => BillingPlan)
    billingPlan: BillingPlan;

    @IsOptional()
    @IsObject()
    analytics?: {
        metaPixelIds?: string[];
    };

    @IsOptional()
    @IsEnum(KYCStatus)
    verificationStatus?: KYCStatus;

    constructor(host: Partial<Host>, logo?: Logo) {
        super();
        Object.assign(this, host);
        const email = host.email?.trim().toLowerCase() || '';
        const alias = cleanAlias(host.alias!);

        this.recordId = host.recordId ?? uuidv4();
        this.alias = alias;
        this.email = email;
        this.name = host.name?.trim() || '';
        this.createdAt = this.createdAt ?? getUTCDate().toISOString();
        this.recordType = DatabaseKeys.HOST;
        this.timezone = host.timezone ?? 'America/Caracas';
        if (logo)
            this.logo = {
                order: 1,
                recordId: uuidv4(),
                type: logo.type,
                source: logo.source,
                path: `public/hosts/${this.recordId}/${logo?.filename}`,
            };
    }
}
