import { AttributeValue } from '@aws-sdk/client-dynamodb';

export interface DeleteRequest {
    DeleteRequest: {
        Key: { [key: string]: AttributeValue };
    };
}
