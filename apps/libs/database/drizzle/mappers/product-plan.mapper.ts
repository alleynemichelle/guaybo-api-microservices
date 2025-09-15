import { ProductPlan, ProductPlanData } from 'apps/libs/domain/products/product-plan.entity';
import { Price } from 'apps/libs/domain/common/price.entity';

export class ProductPlanMapper {
    static toDomain(row: any): ProductPlan {
        const data: ProductPlanData = {
            id: row.id,
            recordId: row.recordId,
            productId: row.productId,
            name: row.name,
            description: row.description,
            orderIndex: row.orderIndex,
            totalBookings: row.totalBookings,
            minCapacity: row.minCapacity,
            maxCapacity: row.maxCapacity,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };

        // Add prices if available
        if (row.prices && Array.isArray(row.prices)) {
            data.prices = row.prices.map(
                (price: any) =>
                    new Price({
                        id: price.id,
                        amount: price.amount,
                        fareType: price.fareType,
                        pricingModel: price.pricingModel,
                        currency: price.currency
                            ? {
                                  id: price.currency.id,
                                  code: price.currency.code,
                                  symbol: price.currency.symbol,
                              }
                            : undefined,
                        createdAt: price.createdAt,
                        updatedAt: price.updatedAt,
                    }),
            );
        }

        return new ProductPlan(data);
    }

    static toDomainWithProduct(row: any): ProductPlan & { product: any } {
        const productPlan = this.toDomain(row);

        return {
            ...productPlan,
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

    static toDomainWithPrices(row: any): ProductPlan & { prices: Price[] } {
        const productPlan = this.toDomain(row);

        return {
            ...productPlan,
            prices:
                row.prices && Array.isArray(row.prices)
                    ? row.prices.map(
                          (price: any) =>
                              new Price({
                                  id: price.id,
                                  amount: price.amount,
                                  fareType: price.fareType,
                                  pricingModel: price.pricingModel,
                                  currency: price.currency
                                      ? {
                                            id: price.currency.id,
                                            code: price.currency.code,
                                            symbol: price.currency.symbol,
                                        }
                                      : undefined,
                                  createdAt: price.createdAt,
                                  updatedAt: price.updatedAt,
                              }),
                      )
                    : [],
        };
    }

    static toDomainWithProductAndPrices(row: any): ProductPlan & { product: any; prices: Price[] } {
        const productPlan = this.toDomain(row);

        return {
            ...productPlan,
            product: row.product
                ? {
                      id: row.product.id,
                      recordId: row.product.recordId,
                      name: row.product.name,
                      alias: row.product.alias,
                  }
                : undefined,
            prices:
                row.prices && Array.isArray(row.prices)
                    ? row.prices.map(
                          (price: any) =>
                              new Price({
                                  id: price.id,
                                  amount: price.amount,
                                  fareType: price.fareType,
                                  pricingModel: price.pricingModel,
                                  currency: price.currency
                                      ? {
                                            id: price.currency.id,
                                            code: price.currency.code,
                                            symbol: price.currency.symbol,
                                        }
                                      : undefined,
                                  createdAt: price.createdAt,
                                  updatedAt: price.updatedAt,
                              }),
                      )
                    : [],
        };
    }
}
