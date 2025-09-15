import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { SQSService } from 'apps/libs/notifications/sqs.service';
import { AppEvent } from 'apps/libs/common/enums/app-event.enum';
import { productNotifications } from 'apps/libs/common/constants/product-notifications.constant';
import { IProductsRepository } from 'apps/libs/repositories/products/products-repository.interface';
import { evaluateConditions } from 'apps/libs/common/utils/conditionals';

export interface NotificationData {
    type: string;
    templateKey: string;
    to: string;
    timezone: string;
    dynamicTemplateData: Record<string, any>;
}

@Injectable()
export class NotificationService {
    private readonly notificationsSQS = this.configService.get('NOTIFICATIONS_SQS_URL') as string;
    constructor(
        private readonly sqsService: SQSService,
        private readonly configService: ConfigService,
        @Inject('ProductsRepository')
        private readonly productsRepository: IProductsRepository,
    ) {}

    /**
     * Sends specific notifications without checking product notifications
     */
    async sendSpecificNotifications(notifications: NotificationData[]): Promise<void> {
        await this.sqsService.sendMessage(
            this.notificationsSQS,
            JSON.stringify({
                event: AppEvent.APP_BATCH_NOTIFICATIONS,
                notifications: notifications.map((notification) => ({
                    ...notification,
                    event: AppEvent.APP_NOTIFICATION,
                })),
            }),
        );
    }

    /**
     * Sends notifications based on product configuration and existing notifications
     */
    async sendNotifications(hostId: string, productId: string, event: string, context: any, data: any) {
        const baseNotifications = productNotifications[event];
        const existingNotifications = await this.productsRepository.getNotifications(hostId, productId, { event });
        const notifications = [...existingNotifications, ...baseNotifications]
            .reduce((acc: any[], notification: any) => {
                if (!acc.some((t) => t.recordId === notification.recordId)) acc.push(notification);
                return acc;
            }, [])
            .filter((notification: any) => evaluateConditions(notification.conditions, data));

        await this.sqsService.sendMessage(
            this.notificationsSQS,
            JSON.stringify({
                event: AppEvent.APP_BATCH_NOTIFICATIONS,
                notifications: notifications.map((template) => ({
                    type: template.type,
                    templateKey: template.templateKey,
                    event: AppEvent.APP_NOTIFICATION,
                    to: this.resolveRecipient(template.recipient, context),
                    timezone: this.resolveTimezone(template.recipient, context),
                    dynamicTemplateData: {
                        ...template.data,
                        ...context,
                    },
                })),
            }),
        );
    }

    private resolveRecipient(recipient: string, context: any): string {
        if (!recipient) recipient = 'customer';
        const recipientMap = {
            host: context?.host?.emails,
            customer: context?.customer?.email,
        };
        return recipientMap[recipient] || recipient;
    }

    private resolveTimezone(recipient: string, context: any): string {
        if (!recipient) recipient = 'customer';
        const recipientMap = {
            host: context?.host?.timezone,
            customer: context?.customer?.timezone,
        };
        return recipientMap[recipient] || recipient;
    }
}
