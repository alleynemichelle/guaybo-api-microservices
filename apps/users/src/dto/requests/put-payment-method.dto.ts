import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { IsEnum, IsOptional, IsObject, IsString } from 'class-validator';

export class PutPaymentMethodDto {
    @ApiProperty({ description: 'Payment method.', enum: PaymentMethod, example: PaymentMethod.ZELLE })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Payment method identifier. Only required if payment method already exists',
        type: String,
        required: false,
        example: '3bd0ca53-488c-4fee-a90b-b1b864408c92',
    })
    @IsString()
    @IsOptional()
    recordId?: string;

    @ApiProperty({
        description: "Custom attributes for user's payment method",
        type: Object,
        required: false,
        example: {
            bank: {
                type: 'BANK',
                required: true,
                value: {
                    key: 'BANCO_DE_VENEZUELA',
                    name: 'Banco de Venezuela',
                },
            },
            nationalId: {
                type: 'string',
                required: true,
                value: 'V-12345678',
            },
        },
    })
    @IsObject()
    @IsOptional()
    customAttributes?: {
        [key: string]: {
            icon?: string;
            key?: string;
            label?: string;
            type?: string;
            required?: boolean;
            value: any;
        };
    };
}
