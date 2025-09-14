import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { Currency } from 'apps/libs/common/enums/currency.enum';

type PaymentOptionResponse = {
    recordId: string;
    createdAt: string;
    updatedAt: string;
    status: Status;
    paymentMethod: PaymentMethod;
    currency: Currency;
    requiresCoordination: boolean;
    icon: string;
    customAttributes: Record<string, any>;
};

@Injectable()
export class GetPaymentMethodsHandler {
    constructor(
        private readonly paymentOptionsRepository: PaymentOptionsRepository,
        private readonly hostsRepository: HostsRepository,
    ) {}

    async execute(recordId: string, filters?: Record<string, any>): Promise<PaymentOptionResponse[]> {
        const host = await this.hostsRepository.findByRecordId(recordId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

        const paymentOptions = await this.paymentOptionsRepository.findByHostId(host.id!);

        let filteredPaymentOptions = paymentOptions;
        const currencies = filters?.currency
            ? Array.isArray(filters.currency)
                ? filters.currency
                : [filters.currency]
            : [];

        if (currencies.length > 0) {
            filteredPaymentOptions = paymentOptions.filter(
                (option) => option.currency && currencies.includes(option.currency),
            );
        }

        return filteredPaymentOptions.map((option) => {
            return {
                recordId: option.recordId!,
                createdAt: option.createdAt ?? '',
                updatedAt: option.updatedAt ?? '',
                status: option.recordStatus as Status,
                paymentMethod: option.paymentMethod as PaymentMethod,
                currency: option.currency as Currency,
                requiresCoordination: option.requiresCoordination,
                icon: option.icon ?? '',
                customAttributes: option.customAttributes as Record<string, any>,
            };
        });
    }
}
