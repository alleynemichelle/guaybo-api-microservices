import { Status } from 'apps/libs/domain/common/status.entity';
import { ProductDate, ProductDateData } from 'apps/libs/domain/products/product-date.entity';

export class ProductDateMapper {
    static toDomain(row: any): ProductDate {
        const data: ProductDateData = {
            id: row.id,
            recordId: row.recordId,
            productId: row.productId,
            initialDate: row.initialDate,
            endDate: row.endDate,
            timezone: row.timezone,
            totalBookings: row.totalBookings,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };

        // Add status if available
        if (row.status) {
            data.status = new Status({
                id: row.status.id as number,
                name: row.status.name as string,
                description: row.status.description as string,
            });
        }

        return new ProductDate(data);
    }

    static toDomainWithProduct(row: any): ProductDate & { product: any } {
        const productDate = this.toDomain(row);

        return {
            ...productDate,
            product: row.product
                ? {
                      id: row.product.id,
                      recordId: row.product.recordId,
                      name: row.product.name,
                      alias: row.product.alias,
                  }
                : undefined,
        };
    }

    static toDomainWithStatus(row: any): ProductDate & { status: Status } {
        const productDate = this.toDomain(row);

        return {
            ...productDate,
            status: row.status
                ? new Status({
                      id: row.status.id,
                      name: row.status.name,
                      description: row.status.description,
                  })
                : undefined,
        };
    }

    static toDomainWithProductAndStatus(row: any): ProductDate & { product: any; status: Status } {
        const productDate = this.toDomain(row);

        return {
            ...productDate,
            product: row.product
                ? {
                      id: row.product.id,
                      recordId: row.product.recordId,
                      name: row.product.name,
                      alias: row.product.alias,
                  }
                : undefined,
            status: row.status
                ? new Status({
                      id: row.status.id,
                      name: row.status.name,
                      description: row.status.description,
                  })
                : undefined,
        };
    }
}
