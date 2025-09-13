import { PaymentOption } from 'apps/libs/domain/bookings/payment-option.entity';
import { PaymentOptionResponseDto } from '../dto/responses/payment-option-response.dto';

export function mapPaymentOption(paymentOption: PaymentOption): PaymentOptionResponseDto {
    return {
        currency: paymentOption.currency,
        icon: paymentOption.icon!,
        requiresCoordination: paymentOption.requiresCoordination,
        paymentMethod: paymentOption.paymentMethod,
        recordId: paymentOption.recordId!,
        customAttributes: paymentOption.customAttributes as Record<string, any>,
        createdAt: paymentOption.createdAt!,
    };
}
