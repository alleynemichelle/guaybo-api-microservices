import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductNotification } from 'apps/libs/domain/products/product-notification.entity';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';

import { CreateNotificationDto } from '../../dto/requests/create-notification.dto';

@Injectable()
export class CreateNotificationHandler {
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly productsRepository: ProductsRepository,
    ) {}

    async execute(
        hostId: string,
        productId: string,
        createNotificationDto: CreateNotificationDto,
    ): Promise<ProductNotification> {
        const product = await this.productsRepository.findByRecordId(productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        // need to validate template key. It must exists on db
        const notification = new ProductNotification(createNotificationDto);

        await this.productsDynamoRepository.createNotification(hostId, productId, notification);
        return notification;
    }
}
