import { Inject, Injectable } from '@nestjs/common';
import { productNotifications } from 'apps/libs/common/constants/product-notifications.constant';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { ProductNotification } from 'apps/libs/domain/products/product-notification.entity';

@Injectable()
export class GetNotificationsHandler {
    constructor(private readonly productsDynamoRepository: ProductsDynamoRepository) {}

    // PRODUCT NOTIFICATIONS
    async execute(hostId: string, productId: string): Promise<ProductNotification[]> {
        const baseNotifications = Object.values(productNotifications).flatMap((notifications) => {
            return notifications.filter((notification) => notification.editable && !notification.system);
        });

        const exitingNotifications = await this.productsDynamoRepository.getNotifications(hostId, productId);
        const notifications = [...exitingNotifications, ...baseNotifications]
            .reduce((acc: any[], notification: any) => {
                if (!acc.some((t) => t.recordId === notification.recordId)) acc.push(notification);
                return acc;
            }, [])
            .map((notification) => ({
                recordId: notification.recordId,
                type: notification.type,
                event: notification.event,
                name: notification.name,
                description: notification.description,
                templateKey: notification.templateKey,
                data: notification.data,
                default: notification.default,
                conditions: notification.conditions,
                editable: notification.editable,
            }));

        return notifications;
    }
}
