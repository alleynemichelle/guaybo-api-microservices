import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsObject, IsOptional } from 'class-validator';
import { WithdrawalMethod } from 'apps/libs/common/enums/withdrawal-method.enum';
import { WithdrawalMethodDetails } from 'apps/libs/domain/hosts/withdrawal-method.entity';

export class CreateWithdrawalMethodDto {
    @ApiProperty({
        description: 'Type of withdrawal method',
        example: WithdrawalMethod.VENEZUELAN_BANK_ACCOUNT,
        enum: WithdrawalMethod,
    })
    @IsEnum(WithdrawalMethod)
    withdrawalMethodType: WithdrawalMethod;

    @ApiProperty({
        description: 'Specific details for the withdrawal method type',
        example: {
            accountNumber: '01020123456789012345',
            bank: 'BANCO_DE_VENEZUELA',
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
}
