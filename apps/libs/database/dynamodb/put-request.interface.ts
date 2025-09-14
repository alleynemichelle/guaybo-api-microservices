import { AttributeValue } from '@aws-sdk/client-dynamodb';

export interface PutRequest {
    PutRequest: {
        Item: { [key: string]: AttributeValue };
    };
}
