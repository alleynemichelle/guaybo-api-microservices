import { Injectable } from '@nestjs/common';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { OwnerType } from 'apps/libs/common/enums/owner-type.enum';
import { PaymentOption } from 'apps/libs/domain/bookings/payment-option.entity';
import { PaymentOptionResponseDto } from '../dto/responses/payment-option-response.dto';

@Injectable()
export class GetPaymentOptionsHandler {
    constructor(private readonly paymentOptionsRepository: PaymentOptionsRepository) {}

    async execute(): Promise<PaymentOptionResponseDto[]> {
        const paymentOptions = await this.paymentOptionsRepository.getAll({ ownerType: OwnerType.APP });
        return paymentOptions.map((paymentOption) => this.mapResponse(paymentOption));
    }

    private mapResponse(paymentOption: PaymentOption): PaymentOptionResponseDto {
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
}
