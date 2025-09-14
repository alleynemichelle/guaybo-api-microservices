import {
    AttributeValue,
    BatchGetItemCommand,
    BatchGetItemCommandInput,
    BatchWriteItemCommand,
    BatchWriteItemCommandInput,
    DeleteItemCommand,
    DeleteItemCommandInput,
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
    QueryCommandInput,
    ReturnValue,
    UpdateItemCommand,
    UpdateItemCommandInput,
    TransactWriteItemsCommand,
    TransactWriteItemsCommandInput,
    TransactWriteItem,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutRequest } from './put-request.interface';
import { DeleteRequest } from './delete-request.interface';

function transformItem(
    data: Record<string, AttributeValue> | undefined,
    deleteKeys?: boolean,
): Record<string, any> | null {
    if (!data) return null;

    const item = unmarshall(data);
    if (deleteKeys) {
        delete item.PK;
        delete item.SK;
    }

    return item;
}

@Injectable()
export class DynamoRepositoryService {
    private client: DynamoDBClient;

    constructor(private configService: ConfigService) {
        const region = this.configService.get('REGION') as string;
        this.client = new DynamoDBClient({ region });
    }

    async get(
        tableName: string,
        key: Record<string, any>,
        attributes?: string,
        consistentRead?: boolean,
    ): Promise<Record<string, any> | null> {
        const params: GetItemCommandInput = {
            TableName: tableName,
            Key: marshall(key),
            ...(attributes ? { ProjectionExpression: attributes } : {}),
            ...(consistentRead && { ConsistentRead: consistentRead }),
        };

        const result = await this.client.send(new GetItemCommand(params));
        return transformItem(result.Item) || null;
    }

    async put(tableName: string, item: Record<string, any>): Promise<Record<string, any> | null> {
        const input: PutItemCommandInput = {
            TableName: tableName,
            Item: marshall(item, {
                removeUndefinedValues: true,
                convertClassInstanceToMap: true,
                convertEmptyValues: true,
            }),
            ReturnValues: ReturnValue.ALL_OLD,
        };

        const result = await this.client.send(new PutItemCommand(input));
        return transformItem(result.Attributes) || null;
    }

    async update(
        tableName: string,
        key: Record<string, any>,
        updates: Record<string, any>,
    ): Promise<Record<string, any> | null> {
        const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, value]) => value !== undefined));

        if (Object.keys(filteredUpdates).length === 0) {
            console.warn('No valid updates provided.');
            return null;
        }

        const updateExpression = `SET ${Object.keys(filteredUpdates)
            .map((key, index) => `#field${index} = :value${index}`)
            .join(', ')}`;

        const expressionAttributeNames = Object.keys(filteredUpdates).reduce(
            (acc, key, index) => ({ ...acc, [`#field${index}`]: key }),
            {},
        );

        const expressionAttributeValues = Object.keys(filteredUpdates).reduce(
            (acc, key, index) => ({ ...acc, [`:value${index}`]: filteredUpdates[key] }),
            {},
        );

        const input: UpdateItemCommandInput = {
            TableName: tableName,
            Key: marshall(key, {
                removeUndefinedValues: true,
                convertClassInstanceToMap: true,
                convertEmptyValues: true,
            }),
            UpdateExpression: updateExpression,
            ...(expressionAttributeValues && Object.values(expressionAttributeValues).length > 0
                ? {
                      ExpressionAttributeValues: marshall(expressionAttributeValues, {
                          removeUndefinedValues: true,
                          convertClassInstanceToMap: true,
                      }),
                  }
                : {}),
            ...(expressionAttributeNames && Object.values(expressionAttributeNames).length > 0
                ? { ExpressionAttributeNames: expressionAttributeNames }
                : {}),
            ReturnValues: ReturnValue.ALL_OLD,
        };

        const result = await this.client.send(new UpdateItemCommand(input));
        return transformItem(result.Attributes) || null;
    }

    async delete(tableName: string, key: Record<string, any>): Promise<Record<string, any> | null> {
        const input: DeleteItemCommandInput = {
            TableName: tableName,
            Key: marshall(key),
            ReturnValues: ReturnValue.ALL_OLD,
        };

        const result = await this.client.send(new DeleteItemCommand(input));
        return transformItem(result.Attributes) || null;
    }

    /**
     * Queries items from DynamoDB dynamically based on the provided parameters.
     *
     * @param tableName - The name of the DynamoDB table to query.
     * @param params - The query parameters, including:
     *   - keyCondition: The key condition expression for the query.
     *   - filterExpression (optional): A filter expression for additional filtering.
     *   - attributeValues (optional): The values to be used in the expression.
     *   - attributeNames (optional): The attribute names to be used in the expression to handle reserved words in DynamoDB.
     *   - attributes (optional): A string of attributes to project (select specific attributes).
     *   - deleteKeys (optional): Whether to delete specific keys from the transformed items.
     * @returns An array of transformed items or null if no items are found.
     * @throws Will throw an error if the query fails.
     */
    public async query(
        tableName: string,
        params: {
            keyCondition: string;
            filterExpression?: string;
            attributeValues?: Record<string, any>;
            attributeNames?: Record<string, string>;
            attributes?: string;
            index?: string;
            deleteKeys?: boolean;
            limit?: number;
            consistentRead?: boolean;
        },
    ): Promise<Record<string, any>[]> {
        try {
            const {
                keyCondition,
                filterExpression,
                attributeValues,
                attributeNames,
                attributes,
                index,
                deleteKeys,
                limit,
                consistentRead,
            } = params;
            const input: QueryCommandInput = {
                TableName: tableName,
                KeyConditionExpression: keyCondition,
                ...(index ? { IndexName: index } : {}),
                ...(consistentRead ? { ConsistentRead: consistentRead } : {}),
                ...(filterExpression && filterExpression.length > 0 ? { FilterExpression: filterExpression } : {}),
                ...(attributeValues && Object.values(attributeValues).length > 0
                    ? { ExpressionAttributeValues: marshall(attributeValues || {}, { removeUndefinedValues: true }) }
                    : {}),
                ...(attributeNames && Object.values(attributeNames).length > 0
                    ? { ExpressionAttributeNames: attributeNames }
                    : {}),
                ...(attributes && attributes.length > 0 ? { ProjectionExpression: attributes } : {}),
                ...(limit && limit > 0 ? { Limit: limit } : {}),
            };

            let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;
            let accumulatedItems: Record<string, any>[] = [];

            do {
                if (lastEvaluatedKey) {
                    input.ExclusiveStartKey = lastEvaluatedKey;
                }

                const response = await this.client.send(new QueryCommand(input));
                if (response.Items) {
                    accumulatedItems = accumulatedItems.concat(
                        response.Items.map((item) => transformItem(item, deleteKeys)),
                    );
                }

                lastEvaluatedKey = response.LastEvaluatedKey;
            } while (lastEvaluatedKey);

            return accumulatedItems.length > 0 ? accumulatedItems : [];
        } catch (error) {
            console.log('Error querying data', error);
            throw error;
        }
    }

    /**
     * Counts items from DynamoDB dynamically based on the provided parameters.
     * This method uses the `Select: 'COUNT'` parameter to efficiently count items without retrieving them.
     *
     * @param tableName - The name of the DynamoDB table to query.
     * @param params - The query parameters, including:
     *   - keyCondition: The key condition expression for the query.
     *   - filterExpression (optional): A filter expression for additional filtering.
     *   - attributeValues (optional): The values to be used in the expression.
     *   - attributeNames (optional): The attribute names to be used in the expression to handle reserved words in DynamoDB.
     *   - index (optional): The name of a secondary index to query.
     * @returns The total number of items matching the query.
     * @throws Will throw an error if the query fails.
     */
    public async count(
        tableName: string,
        params: {
            keyCondition: string;
            filterExpression?: string;
            attributeValues?: Record<string, any>;
            attributeNames?: Record<string, string>;
            index?: string;
        },
    ): Promise<number> {
        try {
            const { keyCondition, filterExpression, attributeValues, attributeNames, index } = params;
            const input: QueryCommandInput = {
                TableName: tableName,
                KeyConditionExpression: keyCondition,
                Select: 'COUNT',
                ...(index ? { IndexName: index } : {}),
                ...(filterExpression && filterExpression.length > 0 ? { FilterExpression: filterExpression } : {}),
                ...(attributeValues && Object.values(attributeValues).length > 0
                    ? { ExpressionAttributeValues: marshall(attributeValues || {}, { removeUndefinedValues: true }) }
                    : {}),
                ...(attributeNames && Object.values(attributeNames).length > 0
                    ? { ExpressionAttributeNames: attributeNames }
                    : {}),
            };

            let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;
            let totalCount = 0;

            do {
                if (lastEvaluatedKey) {
                    input.ExclusiveStartKey = lastEvaluatedKey;
                }

                const response = await this.client.send(new QueryCommand(input));
                totalCount += response.Count || 0;
                lastEvaluatedKey = response.LastEvaluatedKey;
            } while (lastEvaluatedKey);

            return totalCount;
        } catch (error) {
            console.log('Error counting data', error);
            throw error;
        }
    }

    /**
     * Reusable function to perform BatchWriteItem operations in DynamoDB.
     *
     * @param tableName - The name of the table in DynamoDB.
     * @param items - A list of items to insert or delete.
     */
    public async batchWriteItems(tableName: string, items: (PutRequest | DeleteRequest)[]): Promise<void> {
        try {
            for (let i = 0; i < items.length; i += 25) {
                const batch = items.slice(i, i + 25);
                const params: BatchWriteItemCommandInput = {
                    RequestItems: {
                        [tableName]: batch,
                    },
                };
                const data = await this.client.send(new BatchWriteItemCommand(params));
                console.log('Batch write success:', data);
            }
        } catch (error) {
            console.error('Error in batch write:', error);
            throw error;
        }
    }

    async increment(
        tableName: string,
        key: Record<string, any>,
        attributeName: string,
        incrementValue: number,
    ): Promise<Record<string, any> | null> {
        const input: UpdateItemCommandInput = {
            TableName: tableName,
            Key: marshall(key),
            UpdateExpression: `ADD #attr :val`,
            ExpressionAttributeNames: {
                '#attr': attributeName,
            },
            ExpressionAttributeValues: marshall({
                ':val': incrementValue,
            }),
            ReturnValues: ReturnValue.UPDATED_NEW,
        };

        const result = await this.client.send(new UpdateItemCommand(input));
        return transformItem(result.Attributes) || null;
    }

    /**
     * Reusable function to perform TransactWriteItems operations in DynamoDB.
     * @param items - A list of transaction items.
     */
    public async transactWriteItems(items: TransactWriteItem[]): Promise<void> {
        try {
            // DynamoDB TransactWriteItems has a limit of 100 items per request
            for (let i = 0; i < items.length; i += 100) {
                const batch = items.slice(i, i + 100);
                const params: TransactWriteItemsCommandInput = {
                    TransactItems: batch,
                };
                await this.client.send(new TransactWriteItemsCommand(params));
            }
        } catch (error) {
            console.error('Error in transact write:', error);
            throw error;
        }
    }

    /**
     * Reusable function to perform BatchGetItemCommand operations in DynamoDB.
     * @param tableName - The name of the table in DynamoDB.
     * @param items - A list of items to get.
     */
    public async batchGetItems(
        tableName: string,
        items: Record<string, string>[],
        attributes?: string,
    ): Promise<any[]> {
        try {
            const data: any[] = [];

            // Process in batches of 100 (DynamoDB BatchGet limit)
            for (let i = 0; i < items.length; i += 100) {
                const batch = items.slice(i, i + 100);

                // If attributes are provided, construct ExpressionAttributeNames
                let projectionExpression: string | undefined = undefined;
                let expressionAttributeNames: Record<string, string> | undefined = undefined;

                if (attributes) {
                    const attributeNames = attributes.split(',').map((attr) => attr.trim());
                    expressionAttributeNames = attributeNames.reduce(
                        (acc, attr) => {
                            acc[`#${attr}`] = attr; // Map attribute to alias
                            return acc;
                        },
                        {} as Record<string, string>,
                    );

                    projectionExpression = attributeNames.map((attr) => `#${attr}`).join(', ');
                }

                const params: BatchGetItemCommandInput = {
                    RequestItems: {
                        [tableName]: {
                            ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
                            ...(expressionAttributeNames ? { ExpressionAttributeNames: expressionAttributeNames } : {}),
                            Keys: batch.map((key) => marshall(key)),
                        },
                    },
                };

                const response = await this.client.send(new BatchGetItemCommand(params));
                if (response.Responses && response.Responses[tableName]) {
                    data.push(...response.Responses[tableName]);
                }
            }

            return data.map((record) => {
                return unmarshall(record);
            });
        } catch (error) {
            console.error('Error in batch get:', error);
            throw error;
        }
    }
}
