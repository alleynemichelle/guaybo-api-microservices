import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ProductNotification } from 'apps/libs/domain/products/product-notification.entity';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { productNotifications } from 'apps/libs/common/constants/product-notifications.constant';
import { UpdateNotificationDto } from '../../dto/requests/update-notification.dto';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';

@Injectable()
export class UpdateNotificationHandler {
    constructor(
        private readonly productsRepository: ProductsRepository,
        private readonly productsDynamoRepository: ProductsDynamoRepository,
    ) {}

    async execute(
        hostId: string,
        productId: string,
        notificationId: string,
        data: UpdateNotificationDto,
    ): Promise<ProductNotification> {
        const { restore, ...notificationUpdates } = data;

        const product = await this.productsRepository.findByRecordId(productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const existingNotification =
            (await this.productsDynamoRepository.getNotification(hostId, productId, notificationId)) ??
            Object.values(productNotifications)
                .flat()
                .find((n) => n.recordId === notificationId);

        if (!existingNotification) throw new BadRequestException(ProductsErrorCodes.NotificationNotFound);
        if (!existingNotification.editable) throw new BadRequestException(ProductsErrorCodes.NotificationIsNotEditable);

        let updatedNotification: ProductNotification;

        if (restore) {
            const defaultNotification = Object.values(productNotifications)
                .flat()
                .find((n) => n.recordId === notificationId);

            if (!defaultNotification) throw new BadRequestException(ProductsErrorCodes.NotificationNotFound);

            updatedNotification = new ProductNotification(defaultNotification);
        } else {
            updatedNotification = { ...existingNotification, ...notificationUpdates };
        }

        await this.productsDynamoRepository.updateNotification(hostId, productId, notificationId, updatedNotification);

        return updatedNotification;
    }
}
