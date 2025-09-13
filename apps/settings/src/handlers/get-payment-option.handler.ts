import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { PaymentOption } from 'apps/libs/domain/bookings/payment-option.entity';
import { PaymentOptionResponseDto } from '../dto/responses/payment-option-response.dto';
import { mapPaymentOption } from '../utils/map-payment-option';
import { SettingsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';

@Injectable()
export class GetPaymentOptionHandler {
    constructor(private readonly paymentOptionsRepository: PaymentOptionsRepository) {}

    async execute(recordId: string): Promise<PaymentOptionResponseDto> {
        const paymentOption = await this.paymentOptionsRepository.findByRecordId(recordId);
        if (!paymentOption) throw new BadRequestException(SettingsErrorCodes.PaymentOptionNotFound);

        console.log('paymentOption', paymentOption);
        return mapPaymentOption(paymentOption as PaymentOption);
    }
}
