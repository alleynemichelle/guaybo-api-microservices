import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TemplateData, TemplateType } from './telegram.types';
import { templates } from './telegram.templates';
import { TelegramChatId } from './telegram.types';

@Injectable()
export class TelegramRepository {
    private readonly token: string;
    private readonly baseUrl: string;
    private readonly frontendHost: string;
    private readonly stage: string;
    private readonly sendNotifications: boolean;

    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN || '';

        this.frontendHost = process.env.FRONTEND_APP_HOST || '';
        this.baseUrl = `https://api.telegram.org/bot${this.token}`;
        this.sendNotifications = process.env.SEND_TELEGRAM_NOTIFICATIONS === 'true';
        this.stage = process.env.STAGE || 'dev';
    }

    private formatTemplate(template: string, data: TemplateData): string {
        let formattedText = template;

        // Replace all template variables with their values
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            formattedText = formattedText.replace(regex, value || '');
        });

        // Replace frontend host
        formattedText = formattedText.replace(new RegExp('{frontendHost}', 'g'), this.frontendHost);
        formattedText = formattedText.replace(new RegExp('{stage}', 'g'), this.stage);

        return formattedText;
    }

    async sendMessage(
        textOrTemplate: string | { template: TemplateType; data: TemplateData },
        chatId: TelegramChatId = TelegramChatId.GLOBAL,
    ): Promise<void> {
        console.log('Sending telegram message', textOrTemplate, chatId);
        if (!this.token || !this.frontendHost) {
            throw new Error('TELEGRAM_BOT_TOKEN and FRONTEND_APP_HOST must be defined in environment variables');
        }

        if (!this.sendNotifications) {
            console.log('[Telegram] Notifications are disabled. Skipping message send.');
            return;
        }

        const startTime = performance.now();
        try {
            const formData = new URLSearchParams();
            formData.append('chat_id', chatId);
            formData.append('disable_web_page_preview', 'true');

            let messageText: string;
            if (typeof textOrTemplate === 'string') {
                messageText = textOrTemplate;
            } else {
                const template = templates[textOrTemplate.template];
                if (!template) {
                    throw new Error(`Template ${textOrTemplate.template} not found`);
                }
                messageText = this.formatTemplate(template, {
                    ...textOrTemplate.data,
                    federated:
                        textOrTemplate.data.federated !== undefined
                            ? textOrTemplate.data.federated
                                ? 'Sí'
                                : 'No'
                            : undefined,
                    isTest:
                        textOrTemplate.data.isTest !== undefined
                            ? textOrTemplate.data.isTest
                                ? 'Sí'
                                : 'No'
                            : undefined,
                });
            }

            formData.append('text', messageText);

            await axios.post(`${this.baseUrl}/sendMessage`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // Convert to seconds
            console.log(`[Telegram] Message sent successfully in ${duration.toFixed(2)} seconds`);
        } catch (error) {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // Convert to seconds
            console.log('Error sending telegram message', error);
            console.error(`[Telegram] Error sending message after ${duration.toFixed(2)} seconds:`, error);
            console.log('Continuing execution...');
        }
    }
}
