import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { ProductNotification } from 'apps/libs/domain/products/product-notification.entity';
import { setProduct } from 'apps/libs/domain/products/product-factory';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { getYearAndMonth } from 'apps/libs/common/utils/date';

import { DynamoRepositoryService } from 'apps/libs/database/dynamodb/dynamodb.service';

@Injectable()
export class ProductsDynamoRepository {
    private readonly tableName = this.configService.get('TABLE_NAME') as string;
    private readonly aliasIndex = this.configService.get('ALIAS_INDEX') as string;

    constructor(
        private dynamoService: DynamoRepositoryService,
        private configService: ConfigService,
    ) {}

    public async getProduct(hostId: string, productId: string, attributes?: string): Promise<BaseProduct | null> {
        try {
            const keys = {
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}`,
            };

            const product = (await this.dynamoService.get(this.tableName, keys, attributes)) as BaseProduct;
            if (!product || !product.productType) return null;

            return setProduct(product);
        } catch (error) {
            console.log('Error getting product', error);
            throw error;
        }
    }

    public async getProductByAlias(alias: string): Promise<BaseProduct | null> {
        try {
            const input = {
                index: this.aliasIndex,
                keyCondition: 'alias = :alias',
                attributeValues: {
                    ':alias': alias,
                    ':recordType': DatabaseKeys.PRODUCT,
                },
                filterExpression: 'recordType = :recordType',
            };

            const response = (await this.dynamoService.query(this.tableName, input)) as BaseProduct[];
            if (response.length == 0) return null;

            return response[0];
        } catch (error) {
            console.log('error getting product by alias', error);
            throw error;
        }
    }

    public async getProducts(
        hostId: string,
        params?: Record<string, { value: any; operator?: string }>,
        attributes?: string,
    ): Promise<BaseProduct[]> {
        try {
            const attributeValues: Record<string, any> = {
                ':pk': `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                ':recordType': DatabaseKeys.PRODUCT,
            };

            const filterExpressions: string[] = ['recordType = :recordType'];

            for (const [key, { value, operator }] of Object.entries(params || {})) {
                if (value !== undefined) {
                    const paramKey = `:${key}`;

                    switch (operator) {
                        case 'begins_with':
                            filterExpressions.push(`begins_with(${key}, ${paramKey})`);
                            break;
                        case 'contains':
                            filterExpressions.push(`contains(${key}, ${paramKey})`);
                            break;
                        case '>':
                        case '>=':
                        case '<':
                        case '<=':
                            filterExpressions.push(`${key} ${operator} ${paramKey}`);
                            break;
                        default:
                            filterExpressions.push(`${key} = ${paramKey}`);
                            break;
                    }

                    attributeValues[paramKey] = value;
                }
            }

            const input = {
                keyCondition: 'PK = :pk',
                attributeValues,
                attributes,
                filterExpression: filterExpressions.join(' AND '),
            };

            const products = await this.dynamoService.query(this.tableName, input);

            return products.map((product) => setProduct(product)).filter((product) => product !== null);
        } catch (error) {
            console.error('Error getting products', error);
            throw error;
        }
    }

    public async getPublishedProductsByHost(hostId: string): Promise<BaseProduct[]> {
        try {
            const params = {
                productStatus: { value: ProductStatus.PUBLISHED },
                recordStatus: { value: Status.ACTIVE },
            };
            return this.getProducts(hostId, params);
        } catch (error) {
            console.error('Error getting published products by host', error);
            throw error;
        }
    }

    public async createProduct(product: BaseProduct): Promise<void> {
        try {
            const { year, month } = getYearAndMonth();
            const GSI_PK = `${DatabaseKeys.PRODUCT}#${year}-${month}`;
            const GSI_SK = product.createdAt;

            const item = {
                ...product,
                GSI_PK,
                GSI_SK,
                PK: `${DatabaseKeys.HOST}#${product.hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${product.recordId}`,
                recordType: DatabaseKeys.PRODUCT,
            };

            await this.dynamoService.put(this.tableName, item);
        } catch (error) {
            console.log('Error creating product ', product, error);
            throw error;
        }
    }

    public async putProduct(hostId: string, productId: string, data: Partial<BaseProduct>): Promise<void> {
        try {
            const item = {
                ...data,
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}`,
                recordType: DatabaseKeys.PRODUCT,
            };

            await this.dynamoService.put(this.tableName, item);
        } catch (error) {
            console.log('Error updating product ', error);
            throw error;
        }
    }

    public async patchProduct(hostId: string, productId: string, data: Partial<BaseProduct>): Promise<void> {
        try {
            const key = {
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}`,
            };

            await this.dynamoService.update(this.tableName, key, data);
        } catch (error) {
            console.log('Error updating product ', error);
            throw error;
        }
    }

    public async deleteProduct(hostId: string, productId: string): Promise<void> {
        try {
            await this.dynamoService.delete(this.tableName, {
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}`,
            });
        } catch (error) {
            console.log('Error deleting product ', error);
            throw error;
        }
    }

    public async getNotifications(
        hostId: string,
        productId: string,
        filters?: Record<string, any>,
    ): Promise<ProductNotification[]> {
        try {
            const expressionAttributeValues: Record<string, any> = {
                ':pk': `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                ':sk': `${DatabaseKeys.PRODUCT}#${productId}#${DatabaseKeys.NOTIFICATION}`,
            };

            let filterExpression = '';
            if (filters && Object.values(filters).length > 0) {
                const filterExpressions = Object.entries(filters).map(([key, value], index) => {
                    const placeholder = `:filterValue${index}`;
                    expressionAttributeValues[placeholder] = value;
                    return `${key} = ${placeholder}`;
                });

                filterExpression += `${filterExpressions.join(' AND ')}`;
            }

            const params = {
                keyCondition: 'PK = :pk AND begins_with(SK, :sk)',
                filterExpression,
                attributeValues: expressionAttributeValues,
            };

            return (await this.dynamoService.query(this.tableName, params)) as ProductNotification[];
        } catch (error) {
            console.log('Error getting product templates', error);
            throw error;
        }
    }

    public async getNotification(
        hostId: string,
        productId: string,
        notificationId: string,
    ): Promise<ProductNotification> {
        try {
            const key = {
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}#${DatabaseKeys.NOTIFICATION}#${notificationId}`,
            };

            return (await this.dynamoService.get(this.tableName, key)) as ProductNotification;
        } catch (error) {
            console.log('Error getting product template', error);
            throw error;
        }
    }

    public async createNotification(
        hostId: string,
        productId: string,
        data: ProductNotification,
    ): Promise<ProductNotification> {
        try {
            const item = {
                ...data,
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}#${DatabaseKeys.NOTIFICATION}#${data.recordId}`,
            };

            await this.dynamoService.put(this.tableName, item);
            return data;
        } catch (error) {
            console.log('Error creating product ', error);
            throw error;
        }
    }

    public async updateNotification(
        hostId: string,
        productId: string,
        notificationId: string,
        data: Partial<ProductNotification>,
    ): Promise<void> {
        try {
            const { PK, SK, ...notification } = data;
            await this.dynamoService.update(
                this.tableName,
                {
                    PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                    SK: `${DatabaseKeys.PRODUCT}#${productId}#${DatabaseKeys.NOTIFICATION}#${notificationId}`,
                },
                notification,
            );
        } catch (error) {
            console.log('Error updating product ', error);
            throw error;
        }
    }

    public async deleteNotification(hostId: string, productId: string, notificationId: string): Promise<void> {
        try {
            await this.dynamoService.delete(this.tableName, {
                PK: `${DatabaseKeys.HOST}#${hostId}#${DatabaseKeys.PRODUCT}`,
                SK: `${DatabaseKeys.PRODUCT}#${productId}#${DatabaseKeys.NOTIFICATION}#${notificationId}`,
            });
        } catch (error) {
            console.log('Error deleting product ', error);
            throw error;
        }
    }
}
