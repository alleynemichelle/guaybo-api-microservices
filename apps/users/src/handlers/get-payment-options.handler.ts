import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';

@Injectable()
export class GetPaymentOptionsHandler {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly paymentOptionsRepository: PaymentOptionsRepository,
    ) {}

    async execute(userId: string): Promise<any[]> {
        const user = await this.usersRepository.findByRecordId(userId);
        if (!user) throw new NotFoundException(UsersErrorCodes.UserNotFoundException);

        const paymentOptions = await this.paymentOptionsRepository.findByUserId(user.id!);

        return paymentOptions.map((option) => ({
            recordId: option.recordId,
            paymentMethod: option.paymentMethod,
            status: option.recordStatus,
            ...option.customAttributes,
        }));
    }
}
