import { Injectable, NotFoundException } from '@nestjs/common';
import { HostErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { CustomersRepository } from 'apps/libs/database/drizzle/repositories/customers.repository';
import { UpdateCustomerDto } from '../dto/requests/update-customer.dto';

@Injectable()
export class UpdateCustomerHandler {
    constructor(private readonly customersRepository: CustomersRepository) {}

    async execute(hostId: string, userId: string, updateCustomerDto: UpdateCustomerDto): Promise<void> {
        const customer = await this.customersRepository.findDetailsByUserAndHostRecordIds(hostId, userId);
        if (!customer) throw new NotFoundException(HostErrorCodes.CustomerNotFound);

        const tags = updateCustomerDto.tags.map((tag) => ({
            color: tag.color,
            value: tag.value,
            key: `${tag.color}_${tag.value}`,
        }));

        await this.customersRepository.updateById(customer.id!, { tags });
    }
}
