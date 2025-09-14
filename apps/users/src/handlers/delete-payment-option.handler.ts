import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';

@Injectable()
export class DeletePaymentOptionHandler {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly paymentOptionsRepository: PaymentOptionsRepository,
    ) {}

    async execute(userId: string, paymentOptionId: string): Promise<void> {
        const user = await this.usersRepository.findByRecordId(userId);
        if (!user) {
            throw new NotFoundException(UsersErrorCodes.UserNotFoundException);
        }

        const paymentOption = await this.paymentOptionsRepository.findByRecordId(paymentOptionId);
        if (!paymentOption) {
            throw new NotFoundException(UsersErrorCodes.PaymentOptionNotFound);
        }

        if (paymentOption.user?.id !== user.id) {
            throw new UnauthorizedException(UsersErrorCodes.Unauthorized);
        }

        await this.paymentOptionsRepository.deleteByRecordId(paymentOptionId);
    }
}
