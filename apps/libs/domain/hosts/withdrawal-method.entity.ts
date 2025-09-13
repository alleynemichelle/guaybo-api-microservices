import { v4 as uuidv4 } from 'uuid';
import { IsString, IsNotEmpty, IsEnum, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { WithdrawalMethod } from 'apps/libs/common/enums/withdrawal-method.enum';
import { Status } from 'apps/libs/common/enums/status.enum';

import { Base } from '../common/base.entity';

export class WithdrawalMethodDetails {
    @ApiProperty({
        description: 'Account holder name (taken from identity)',
        example: 'Juan Carlos Pérez González',
    })
    @IsString()
    @IsOptional()
    accountHolderName?: string;

    @ApiProperty({
        description: 'Document number (taken from identity)',
        example: 'V-12345678',
    })
    @IsString()
    @IsNotEmpty()
    documentNumber?: string;

    @ApiProperty({
        description: 'Document type (taken from identity)',
        example: 'passport',
    })
    @IsString()
    @IsNotEmpty()
    documentType?: string;

    @ApiProperty({
        description: 'Bank information for bank accounts',
        example: 'BANCO_DE_VENEZUELA',
    })
    @IsString()
    @IsOptional()
    bankKey?: string;

    @ApiProperty({
        description: 'Account number',
        example: '01020123456789012345',
    })
    @IsString()
    @IsNotEmpty()
    accountNumber?: string;
}

export class WithdrawalMethodEntity extends Base {
    @ApiProperty({
        description: 'Host identifier',
        example: '11111111-2222-3333-4444-555555555555',
    })
    @IsString()
    @IsNotEmpty()
    hostId: string;

    @ApiProperty({
        description: 'Type of withdrawal method',
        example: WithdrawalMethod.VENEZUELAN_BANK_ACCOUNT,
        enum: WithdrawalMethod,
    })
    @IsEnum(WithdrawalMethod)
    withdrawalMethodType: WithdrawalMethod;

    @ApiProperty({
        description: 'Details of the withdrawal method',
        example: {
            accountHolderName: 'Juan Carlos Pérez González',
            documentNumber: 'V-12345678',
            documentType: 'passport',
            bank: 'BANCO_DE_VENEZUELA',
            accountNumber: '01020123456789012345',
        },
    })
    @IsObject()
    @IsNotEmpty()
    details: WithdrawalMethodDetails;

    @ApiProperty({
        description: 'Additional metadata for the withdrawal method',
        example: {
            isDefault: true,
            description: 'Cuenta principal',
        },
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    constructor(data: Partial<WithdrawalMethodEntity>) {
        super();
        Object.assign(this, data);

        this.recordId = data.recordId ?? uuidv4();
        this.createdAt = getUTCDate().toISOString();
        this.recordType = DatabaseKeys.WITHDRAWAL_METHOD;
        this.recordStatus = data.recordStatus ?? Status.ACTIVE;
    }
}
