import { Injectable, NotFoundException } from '@nestjs/common';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { CustomersRepository } from 'apps/libs/database/drizzle/repositories/customers.repository';
import { transformFullName } from 'apps/users/src/utils/transforms';
import { CustomerDetailsDto } from '../dto/responses/get-customer-response.dto';

@Injectable()
export class GetCustomerHandler {
    constructor(private readonly customersRepository: CustomersRepository) {}

    async execute(hostId: string, userId: string): Promise<CustomerDetailsDto> {
        const customer = await this.customersRepository.findDetailsByUserAndHostRecordIds(hostId, userId);
        if (!customer || !customer.user) throw new NotFoundException(HostErrorCodes.CustomerNotFound);

        const user = customer.user;

        return {
            createdAt: customer.createdAt!,
            updatedAt: customer.updatedAt!,
            userId: user.recordId!,
            recordId: customer.recordId!,
            firstName: customer.firstName!,
            lastName: customer.lastName!,
            fullName: transformFullName(customer.firstName!, customer.lastName!),
            email: customer.email!,
            instagramAccount: customer.instagramAccount!,
            totalBookings: customer.totalBookings!,
            phoneNumber: customer.phoneNumber!,
            tags: customer.tags as { color: string; value: string; key: string }[],
        };
    }
}
