import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalMethodDto {
    @ApiProperty({
        description: 'Withdrawal method key',
        example: 'VENEZUELAN_BANK_ACCOUNT',
    })
    key: string;

    @ApiProperty({
        description: 'Withdrawal method name',
        example: 'Cuenta Bancaria Venezolana',
    })
    name: string;

    @ApiProperty({
        description: 'Currency code',
        example: 'VES',
    })
    currency: string;

    @ApiProperty({
        description: 'Whether identity verification is required',
        example: true,
    })
    requiresIdentity: boolean;
}

export class GetWithdrawalMethodsResponse {
    @ApiProperty({
        description: 'Withdrawal methods data',
        type: [WithdrawalMethodDto],
    })
    data: WithdrawalMethodDto[];
}
