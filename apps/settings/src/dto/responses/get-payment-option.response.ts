import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { PaymentOptionResponseDto } from './payment-option-response.dto';

export class GetPaymentOptionResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get payment option by key.',
        example: {
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
    })
    data: PaymentOptionResponseDto;
}
