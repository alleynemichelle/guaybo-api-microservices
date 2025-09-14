import { ApiProperty } from '@nestjs/swagger';
import { WithdrawalMethodDetails } from 'apps/libs/domain/hosts/withdrawal-method.entity';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateWithdrawalMethodDto {
    @ApiProperty({
        description: 'Specific details for the withdrawal method type',
        example: {
            accountNumber: '01020123456789012345',
            bankKey: 'BANCO_DE_VENEZUELA',
        },
    })
    @IsObject()
    @IsOptional()
    details?: WithdrawalMethodDetails;

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
