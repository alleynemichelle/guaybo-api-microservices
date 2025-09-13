import { ApiProperty } from '@nestjs/swagger';

class CustomAttributeDto {
    @ApiProperty({
        description: 'The type of the attribute (e.g., "string", "BANK").',
        example: 'string',
    })
    type: string;

    @ApiProperty({
        description: 'The value of the attribute. Can be a string or a nested object.',
        required: false,
        example: 'Some value',
    })
    value?: any;

    @ApiProperty({
        description: 'Indicates if the attribute is required.',
        example: true,
    })
    required: boolean;
}

export class PaymentOptionResponseDto {
    @ApiProperty({ example: 'USD' })
    currency: string;

    @ApiProperty({ example: 'binance' })
    icon: string;

    @ApiProperty({ example: false })
    requiresCoordination: boolean;

    @ApiProperty({
        description: 'A map of custom attributes for the payment method.',
        type: 'object',
        additionalProperties: {
            $ref: '#/components/schemas/CustomAttributeDto',
        },
    })
    customAttributes: Record<string, CustomAttributeDto>;

    @ApiProperty({ example: 'BINANCE' })
    paymentMethod: string;

    @ApiProperty({ example: '24700894-a3b1-4554-b83f-b721b089b21f' })
    recordId: string;

    @ApiProperty({ required: false, example: '2025-02-08T01:41:36.257Z' })
    updatedAt?: string;

    @ApiProperty({ required: false, example: '2025-02-08T01:41:36.256Z' })
    createdAt?: string;
}
