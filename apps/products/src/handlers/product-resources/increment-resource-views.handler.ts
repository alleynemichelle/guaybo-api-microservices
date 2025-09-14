import { BadRequestException } from '@nestjs/common';

import { ProductResourcesRepository } from 'apps/libs/database/drizzle/repositories/product-resources.repository';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';

export class IncrementResourceViewsHandler {
    constructor(private readonly productResourcesRepository: ProductResourcesRepository) {}

    async execute(resourceRecordId: string): Promise<void> {
        // Verify resource exists before incrementing
        const resource = await this.productResourcesRepository.getByRecordId(resourceRecordId);
        if (!resource) throw new BadRequestException(ProductsErrorCodes.ProductResourceNotFound);

        // Increment the view count
        await this.productResourcesRepository.incrementViews(resourceRecordId);
    }
}
