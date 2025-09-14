import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { NewProduct, ProductWithTotalBookings, ProductWithRelations, Product } from '../types';

// Create a concrete implementation of BaseProduct for mapping
class ProductEntity extends BaseProduct {
    constructor(data: Partial<BaseProduct>) {
        super(data);
    }
}

export class ProductMapper {
    static toDomain(row: ProductWithTotalBookings | ProductWithRelations | Product): BaseProduct {
        // Extract common fields
        const baseData = {
            id: row.id,
            recordId: row.recordId,
            name: row.name,
            alias: row.alias || '', // Ensure alias is not undefined
            totalBookings: 'totalBookings' in row ? row.totalBookings || 0 : 0,
        };

        // Extract productType if available
        let productType: ProductType | undefined;
        if ('productType' in row && row.productType) {
            productType = row.productType.key as ProductType;
        }

        // Extract productStatus if available
        let productStatus: ProductStatus | undefined;
        if ('status' in row && row.status) {
            productStatus = row.status.name as ProductStatus;
        }

        // Extract host data if available
        let hostData: { id: number; recordId: string } | undefined;
        if ('host' in row && row.host) {
            hostData = {
                id: row.hostId,
                recordId: row.host.recordId ?? '',
            };
        }

        const product = new ProductEntity({
            ...baseData,
            ...(productType && { productType }),
            ...(productStatus && { productStatus }),
            ...(hostData && { host: hostData }),
        });

        // Set additional fields from the entity
        product.recordStatus = Status.ACTIVE; // Default status
        product.recordType = DatabaseKeys.PRODUCT;
        product.createdAt = row.createdAt?.toISOString();
        product.updatedAt = row.updatedAt?.toISOString();

        return product;
    }

    static toPersistence(entity: BaseProduct, hostId: number, productTypeId: number): NewProduct {
        return {
            recordId: entity.recordId,
            hostId: hostId,
            name: entity.name,
            alias: entity.alias || '', // Ensure alias is not undefined
            totalBookings: entity.totalBookings || 0,
            productTypeId: productTypeId, // Required field
        };
    }
}
