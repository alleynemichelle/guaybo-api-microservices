import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SQSService {
    private sqsClient: SQSClient;
    private region: string = this.configService.get('REGION') as string;

    constructor(private configService: ConfigService) {
        this.sqsClient = new SQSClient({ region: this.region });
    }

    /**
     * Sends a single message to the SQS queue
     * @param body The content of the message
     */
    public async sendMessage(queueUrl: string, body: string): Promise<void> {
        const params = {
            QueueUrl: queueUrl,
            MessageBody: body,
        };

        try {
            const command = new SendMessageCommand(params);
            const response = await this.sqsClient.send(command);
            console.log(`Message sent with ID: ${response.MessageId}`);
        } catch (error) {
            console.error('Error sending message to SQS:', error);
            throw error;
        }
    }

    /**
     * Sends multiple messages to the SQS queue
     * @param messages Array of message bodies
     */
    public async sendMessages(queueUrl: string, messages: Record<string, any>[]): Promise<void> {
        for (const body of messages) {
            await this.sendMessage(queueUrl, JSON.stringify(body));
        }
    }
}
