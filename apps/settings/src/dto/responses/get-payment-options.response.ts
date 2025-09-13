import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { PaymentOptionResponseDto } from './payment-option-response.dto';

export class GetPaymentOptionsResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get payment options.',
        example: [
            {
                currency: 'USD',
                icon: 'binance',
                requiresCoordination: false,
                recordStatus: 'ACTIVE',
                customAttributes: {
                    description: {
                        type: 'string',
                        value: 'En el comprobante de pago debe contener el número de referencia de la transacción',
                        required: false,
                    },
                    email: {
                        type: 'EMAIL',
                        value: 'ejemplo@gmail.com',
                        required: true,
                    },
                },
                paymentMethod: 'BINANCE',
                recordId: '24700894-a3b1-4554-b83f-b721b089b21f',
            },
            {
                currency: 'VES',
                icon: 'phone',
                requiresCoordination: false,
                updatedAt: '2025-02-08T01:41:36.257Z',
                recordStatus: 'ACTIVE',
                customAttributes: {
                    description: {
                        type: 'string',
                        required: false,
                    },
                    bank: {
                        type: 'BANK',
                        value: {
                            name: 'Banco de Venezuela',
                            key: 'BANCO_DE_VENEZUELA',
                        },
                        required: true,
                    },
                    phoneNumber: {
                        type: 'PHONE_NUMBER',
                        value: {
                            number: '4121234567',
                            code: '+58',
                        },
                        required: true,
                    },
                    nationalId: {
                        type: 'string',
                        value: 'J-1234567',
                        required: true,
                    },
                },
                createdAt: '2025-02-08T01:41:36.256Z',
                paymentMethod: 'MOBILE_PAYMENT',
                recordId: '28d23974-191e-4c1f-9455-05c7fa2576fd',
            },
            {
                currency: 'USD',
                icon: 'cash',
                requiresCoordination: true,
                updatedAt: '2025-02-14T19:46:53.997Z',
                recordStatus: 'ACTIVE',
                customAttributes: {
                    description: {
                        type: 'string',
                        value: 'Te contactará el equipo interno para concretar el pago.',
                        required: true,
                    },
                },
                createdAt: '2025-02-14T19:46:53.997Z',
                paymentMethod: 'CASH',
                recordId: 'a18ba64c-a810-48fd-adaa-e84591c78a4e',
            },
        ],
    })
    data: PaymentOptionResponseDto[];
}
