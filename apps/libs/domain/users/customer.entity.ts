import { v4 as uuidv4 } from 'uuid';

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, ValidateNested, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';

import { Base } from '../common/base.entity';
import { PhoneNumber } from '../common/phone-number.entity';

export class Customer extends Base {
    @ApiProperty({
        description: 'Host identifier',
        example: '67890',
    })
    @IsNotEmpty()
    @IsString()
    hostId: string;

    @ApiProperty({
        description: 'App user identifier',
        example: '6789012',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    @IsOptional()
    @IsString()
    instagramAccount?: string;

    @IsNumber()
    @Min(0)
    totalBookings?: number;

    constructor(customer: Partial<Customer>) {
        super();
        Object.assign(this, customer);
        const email = customer.email?.trim().toLowerCase();

        this.recordId = customer.recordId ?? uuidv4();
        this.alias = email;
        this.email = email || '';
        this.fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        this.createdAt = getUTCDate().toISOString();
        this.recordType = DatabaseKeys.CUSTOMER;
    }
}
