import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalMethodResponseDto {
    @ApiProperty({
        example: 'VENEZUELAN_BANK_ACCOUNT',
        description: 'The unique key for the withdrawal method.',
    })
    key: string;

    @ApiProperty({
        example: 'Cuenta Bancaria Venezolana',
        description: 'The display name of the withdrawal method.',
    })
    name: string;

    @ApiProperty({
        example: 'VES',
        description: 'The currency associated with the withdrawal method.',
    })
    currency: string;

    @ApiProperty({
        example: true,
        description: 'Indicates if identity verification is required for this method.',
    })
    requiresIdentity: boolean;
}
