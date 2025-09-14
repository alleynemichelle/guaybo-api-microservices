import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { PaymentOption } from 'apps/libs/entities/bookings/payment-option.entity';

export class GetPaymentMethodsResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get product methods response.',
        type: [PaymentOption],
        example: [
            {
                currency: 'USD',
                icon: 'zelle',
                requiresCoordination: false,
                updatedAt: '2025-02-14T19:46:53.997Z',
                recordStatus: 'ACTIVE',
                customAttributes: {
                    description: {
                        type: 'string',
                        value: 'Al efectuar el pago, debes añadir la palabra “SPORTPLANNING” como concepto.',
                        required: false,
                    },
                    email: {
                        type: 'EMAIL',
                        value: 'test@gmail.com',
                        required: true,
                    },
                    phoneNumber: {
                        type: 'PHONE_NUMBER',
                        value: {
                            number: '(305) 123-4567',
                            code: '+1',
                        },
                        required: true,
                    },
                },
                createdAt: '2025-02-14T19:46:53.997Z',
                paymentMethod: 'ZELLE',
                recordId: '1235de3f-5be4-464a-8ad1-13abcb6b899e',
            },
        ],
    })
    data: PaymentOption[];
}
