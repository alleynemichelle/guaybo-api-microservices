import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Status } from 'apps/libs/common/enums/status.enum';
import { PaymentMethodsRepository } from 'apps/libs/database/drizzle/repositories/payment-methods.repository';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { OwnerType } from 'apps/libs/common/enums/owner-type.enum';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { StatusLookup } from 'apps/libs/database/drizzle/lookups/status.lookup';
import { NewPaymentOption } from 'apps/libs/database/drizzle/types';
import { PutPaymentMethodDto } from '../dto/requests/put-payment-method.dto';

@Injectable()
export class PutPaymentOptionsHandler {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly paymentOptionsRepository: PaymentOptionsRepository,
        private readonly paymentMethodsRepository: PaymentMethodsRepository,
        private readonly statusLookup: StatusLookup,
    ) {}

    async execute(userId: string, paymentOptionsDto: PutPaymentMethodDto[]): Promise<any[]> {
        const user = await this.usersRepository.findByRecordId(userId);
        if (!user) throw new NotFoundException(UsersErrorCodes.UserNotFoundException);

        const activeStatusId = await this.statusLookup.toId(Status.ACTIVE);

        const paymentMethodKeys = paymentOptionsDto.map((p) => p.paymentMethod);
        const availableMethods = await this.paymentMethodsRepository.findByKeys(paymentMethodKeys);

        if (availableMethods.length !== paymentMethodKeys.length) {
            throw new BadRequestException(UsersErrorCodes.PaymentMethodNotFound);
        }
        const methodsMap = new Map(availableMethods.map((m) => [m.key, m.id]));

        const paymentOptions: NewPaymentOption[] = paymentOptionsDto.map((option) => {
            const { paymentMethod, ...customAttributes } = option;
            return {
                customAttributes,
                paymentMethodId: methodsMap.get(paymentMethod)!,
                userId: user.id,
                statusId: activeStatusId,
                ownerType: OwnerType.USER,
            };
        });

        return this.paymentOptionsRepository.replaceForUser(user.id!, paymentOptions);
    }
}
