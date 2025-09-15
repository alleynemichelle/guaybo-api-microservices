import { and, eq, inArray } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../services/database.service';
import { productPlan, productPrice, currency, product } from '../schemas';
import { ProductPlanMapper } from '../mappers/product-plan.mapper';

@Injectable()
export class ProductPlansRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public async findByRecordId(planRecordId: string): Promise<any> {
        const db = this.databaseService.getDatabase();

        // Buscar el plan principal
        const planResult = await db
            .select({
                // Plan
                planId: productPlan.id,
                planRecordId: productPlan.recordId,
                planName: productPlan.name,
                planDescription: productPlan.description,
                planOrderIndex: productPlan.orderIndex,
                planTotalBookings: productPlan.totalBookings,
                planMinCapacity: productPlan.minCapacity,
                planMaxCapacity: productPlan.maxCapacity,
                planCreatedAt: productPlan.createdAt,
                planUpdatedAt: productPlan.updatedAt,

                // Producto
                productId: product.id,
                productRecordId: product.recordId,
                productName: product.name,
                productAlias: product.alias,
            })
            .from(productPlan)
            .leftJoin(product, eq(productPlan.productId, product.id))
            .where(eq(productPlan.recordId, Number(planRecordId)))
            .limit(1);

        if (!planResult || planResult.length === 0) {
            return undefined;
        }

        const planData = planResult[0];

        // Buscar precios del plan
        const pricesResult = await db
            .select({
                priceId: productPrice.id,
                priceAmount: productPrice.amount,
                priceFareType: productPrice.fareType,
                pricePricingModel: productPrice.pricingModel,
                priceCreatedAt: productPrice.createdAt,
                priceUpdatedAt: productPrice.updatedAt,

                // Moneda
                currencyId: currency.id,
                currencyCode: currency.code,
                currencySymbol: currency.symbol,
            })
            .from(productPrice)
            .leftJoin(currency, eq(productPrice.currencyId, currency.id))
            .where(eq(productPrice.productPlanId, planData.planId));

        // Construir datos para el mapper
        const planDataForMapper = {
            id: planData.planId,
            recordId: planData.planRecordId,
            productId: planData.productId,
            name: planData.planName,
            description: planData.planDescription,
            orderIndex: planData.planOrderIndex,
            totalBookings: planData.planTotalBookings,
            minCapacity: planData.planMinCapacity,
            maxCapacity: planData.planMaxCapacity,
            createdAt: planData.planCreatedAt,
            updatedAt: planData.planUpdatedAt,
            product: {
                id: planData.productId,
                recordId: planData.productRecordId,
                name: planData.productName,
                alias: planData.productAlias,
            },
            prices: pricesResult.map((price) => ({
                id: price.priceId,
                amount: price.priceAmount,
                fareType: price.priceFareType,
                pricingModel: price.pricePricingModel,
                createdAt: price.priceCreatedAt,
                updatedAt: price.priceUpdatedAt,
                currency: {
                    id: price.currencyId,
                    code: price.currencyCode,
                    symbol: price.currencySymbol,
                },
            })),
        };

        return ProductPlanMapper.toDomainWithProductAndPrices(planDataForMapper);
    }

    public async findByRecordIds(planRecordIds: string[]): Promise<any[]> {
        const db = this.databaseService.getDatabase();

        if (planRecordIds.length === 0) {
            return [];
        }

        // Buscar los planes principales
        const plansResult = await db
            .select({
                // Plan
                planId: productPlan.id,
                planRecordId: productPlan.recordId,
                planName: productPlan.name,
                planDescription: productPlan.description,
                planOrderIndex: productPlan.orderIndex,
                planTotalBookings: productPlan.totalBookings,
                planMinCapacity: productPlan.minCapacity,
                planMaxCapacity: productPlan.maxCapacity,
                planCreatedAt: productPlan.createdAt,
                planUpdatedAt: productPlan.updatedAt,

                // Producto
                productId: product.id,
                productRecordId: product.recordId,
                productName: product.name,
                productAlias: product.alias,
            })
            .from(productPlan)
            .leftJoin(product, eq(productPlan.productId, product.id))
            .where(
                inArray(
                    productPlan.recordId,
                    planRecordIds.map((id) => Number(id)),
                ),
            );

        if (plansResult.length === 0) {
            return [];
        }

        // Obtener IDs de los planes encontrados
        const planIds = plansResult.map((plan) => plan.planId);

        // Buscar precios de todos los planes
        const pricesResult = await db
            .select({
                planId: productPrice.productPlanId,
                priceId: productPrice.id,
                priceAmount: productPrice.amount,
                priceFareType: productPrice.fareType,
                pricePricingModel: productPrice.pricingModel,
                priceCreatedAt: productPrice.createdAt,
                priceUpdatedAt: productPrice.updatedAt,

                // Moneda
                currencyId: currency.id,
                currencyCode: currency.code,
                currencySymbol: currency.symbol,
            })
            .from(productPrice)
            .leftJoin(currency, eq(productPrice.currencyId, currency.id))
            .where(inArray(productPrice.productPlanId, planIds));

        // Agrupar precios por plan
        const pricesByPlan = new Map();
        pricesResult.forEach((price) => {
            if (!pricesByPlan.has(price.planId)) {
                pricesByPlan.set(price.planId, []);
            }
            pricesByPlan.get(price.planId).push({
                id: price.priceId,
                amount: price.priceAmount,
                fareType: price.priceFareType,
                pricingModel: price.pricePricingModel,
                createdAt: price.priceCreatedAt,
                updatedAt: price.priceUpdatedAt,
                currency: {
                    id: price.currencyId,
                    code: price.currencyCode,
                    symbol: price.currencySymbol,
                },
            });
        });

        // Construir resultado final usando el mapper
        return plansResult.map((plan) => {
            const planDataForMapper = {
                id: plan.planId,
                recordId: plan.planRecordId,
                productId: plan.productId,
                name: plan.planName,
                description: plan.planDescription,
                orderIndex: plan.planOrderIndex,
                totalBookings: plan.planTotalBookings,
                minCapacity: plan.planMinCapacity,
                maxCapacity: plan.planMaxCapacity,
                createdAt: plan.planCreatedAt,
                updatedAt: plan.planUpdatedAt,
                product: {
                    id: plan.productId,
                    recordId: plan.productRecordId,
                    name: plan.productName,
                    alias: plan.productAlias,
                },
                prices: pricesByPlan.get(plan.planId) || [],
            };

            return ProductPlanMapper.toDomainWithProductAndPrices(planDataForMapper);
        });
    }

    public async findByProductId(productId: number): Promise<any[]> {
        const db = this.databaseService.getDatabase();

        // Buscar todos los planes del producto
        const plansResult = await db
            .select({
                // Plan
                planId: productPlan.id,
                planRecordId: productPlan.recordId,
                planName: productPlan.name,
                planDescription: productPlan.description,
                planOrderIndex: productPlan.orderIndex,
                planTotalBookings: productPlan.totalBookings,
                planMinCapacity: productPlan.minCapacity,
                planMaxCapacity: productPlan.maxCapacity,
                planCreatedAt: productPlan.createdAt,
                planUpdatedAt: productPlan.updatedAt,
            })
            .from(productPlan)
            .where(eq(productPlan.productId, productId))
            .orderBy(productPlan.orderIndex);

        if (plansResult.length === 0) {
            return [];
        }

        // Obtener IDs de los planes
        const planIds = plansResult.map((plan) => plan.planId);

        // Buscar precios de todos los planes
        const pricesResult = await db
            .select({
                planId: productPrice.productPlanId,
                priceId: productPrice.id,
                priceAmount: productPrice.amount,
                priceFareType: productPrice.fareType,
                pricePricingModel: productPrice.pricingModel,
                priceCreatedAt: productPrice.createdAt,
                priceUpdatedAt: productPrice.updatedAt,

                // Moneda
                currencyId: currency.id,
                currencyCode: currency.code,
                currencySymbol: currency.symbol,
            })
            .from(productPrice)
            .leftJoin(currency, eq(productPrice.currencyId, currency.id))
            .where(inArray(productPrice.productPlanId, planIds));

        // Agrupar precios por plan
        const pricesByPlan = new Map();
        pricesResult.forEach((price) => {
            if (!pricesByPlan.has(price.planId)) {
                pricesByPlan.set(price.planId, []);
            }
            pricesByPlan.get(price.planId).push({
                id: price.priceId,
                amount: price.priceAmount,
                fareType: price.priceFareType,
                pricingModel: price.pricePricingModel,
                createdAt: price.priceCreatedAt,
                updatedAt: price.priceUpdatedAt,
                currency: {
                    id: price.currencyId,
                    code: price.currencyCode,
                    symbol: price.currencySymbol,
                },
            });
        });

        // Construir resultado final usando el mapper
        return plansResult.map((plan) => {
            const planDataForMapper = {
                id: plan.planId,
                recordId: plan.planRecordId,
                productId: productId, // Usar el productId del parámetro del método
                name: plan.planName,
                description: plan.planDescription,
                orderIndex: plan.planOrderIndex,
                totalBookings: plan.planTotalBookings,
                minCapacity: plan.planMinCapacity,
                maxCapacity: plan.planMaxCapacity,
                createdAt: plan.planCreatedAt,
                updatedAt: plan.planUpdatedAt,
                prices: pricesByPlan.get(plan.planId) || [],
            };

            return ProductPlanMapper.toDomainWithPrices(planDataForMapper);
        });
    }
}
