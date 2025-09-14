import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';

@Injectable()
export class DeleteNotificationHandler {
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly productsRepository: ProductsRepository,
    ) {}

    async execute(hostId: string, productId: string, notificationId: string): Promise<void> {
        const product = await this.productsRepository.findByRecordId(productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        await this.productsDynamoRepository.deleteNotification(hostId, productId, notificationId);
    }
}
