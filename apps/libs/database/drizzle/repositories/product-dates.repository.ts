import { and, eq, inArray } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../services/database.service';
import { productDate, product, status } from '../schemas';
import { ProductDateMapper } from '../mappers/product-date.mapper';

@Injectable()
export class ProductDatesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public async findByRecordId(dateRecordId: string): Promise<any> {
        const db = this.databaseService.getDatabase();

        // Buscar la fecha principal con su estado y producto
        const dateResult = await db
            .select({
                // Fecha
                dateId: productDate.id,
                dateRecordId: productDate.recordId,
                dateInitialDate: productDate.initialDate,
                dateEndDate: productDate.endDate,
                dateTimezone: productDate.timezone,
                dateTotalBookings: productDate.totalBookings,
                dateCreatedAt: productDate.createdAt,
                dateUpdatedAt: productDate.updatedAt,

                // Estado de la fecha
                dateStatusId: productDate.statusId,
                dateStatusName: status.name,
                dateStatusDescription: status.description,

                // Producto
                productId: product.id,
                productRecordId: product.recordId,
                productName: product.name,
                productAlias: product.alias,
            })
            .from(productDate)
            .leftJoin(status, eq(productDate.statusId, status.id))
            .leftJoin(product, eq(productDate.productId, product.id))
            .where(eq(productDate.recordId, dateRecordId))
            .limit(1);

        if (!dateResult || dateResult.length === 0) {
            return undefined;
        }

        const dateData = dateResult[0];

        // Construir datos para el mapper
        const dateDataForMapper = {
            id: dateData.dateId,
            recordId: dateData.dateRecordId,
            productId: dateData.productId,
            initialDate: dateData.dateInitialDate,
            endDate: dateData.dateEndDate,
            timezone: dateData.dateTimezone,
            totalBookings: dateData.dateTotalBookings,
            createdAt: dateData.dateCreatedAt,
            updatedAt: dateData.dateUpdatedAt,
            status: {
                id: dateData.dateStatusId,
                name: dateData.dateStatusName,
                description: dateData.dateStatusDescription,
            },
            product: {
                id: dateData.productId,
                recordId: dateData.productRecordId,
                name: dateData.productName,
                alias: dateData.productAlias,
            },
        };

        return ProductDateMapper.toDomainWithProductAndStatus(dateDataForMapper);
    }

    public async findByRecordIds(dateRecordIds: string[]): Promise<any[]> {
        const db = this.databaseService.getDatabase();

        if (dateRecordIds.length === 0) {
            return [];
        }

        // Buscar las fechas principales con sus estados y productos
        const datesResult = await db
            .select({
                // Fecha
                dateId: productDate.id,
                dateRecordId: productDate.recordId,
                dateInitialDate: productDate.initialDate,
                dateEndDate: productDate.endDate,
                dateTimezone: productDate.timezone,
                dateTotalBookings: productDate.totalBookings,
                dateCreatedAt: productDate.createdAt,
                dateUpdatedAt: productDate.updatedAt,

                // Estado de la fecha
                dateStatusId: productDate.statusId,
                dateStatusName: status.name,
                dateStatusDescription: status.description,

                // Producto
                productId: product.id,
                productRecordId: product.recordId,
                productName: product.name,
                productAlias: product.alias,
            })
            .from(productDate)
            .leftJoin(status, eq(productDate.statusId, status.id))
            .leftJoin(product, eq(productDate.productId, product.id))
            .where(inArray(productDate.recordId, dateRecordIds))
            .orderBy(productDate.initialDate);

        if (datesResult.length === 0) {
            return [];
        }

        // Construir resultado final
        return datesResult.map((date) => ({
            // Información de la fecha
            date: {
                id: date.dateId,
                recordId: date.dateRecordId,
                initialDate: date.dateInitialDate,
                endDate: date.dateEndDate,
                timezone: date.dateTimezone,
                totalBookings: date.dateTotalBookings,
                createdAt: date.dateCreatedAt,
                updatedAt: date.dateUpdatedAt,
            },

            // Estado de la fecha
            status: {
                id: date.dateStatusId,
                name: date.dateStatusName,
                description: date.dateStatusDescription,
            },

            // Información del producto
            product: {
                id: date.productId,
                recordId: date.productRecordId,
                name: date.productName,
                alias: date.productAlias,
            },
        }));
    }

    public async findByProductId(productId: number): Promise<any[]> {
        const db = this.databaseService.getDatabase();

        // Buscar todas las fechas del producto
        const datesResult = await db
            .select({
                // Fecha
                dateId: productDate.id,
                dateRecordId: productDate.recordId,
                dateInitialDate: productDate.initialDate,
                dateEndDate: productDate.endDate,
                dateTimezone: productDate.timezone,
                dateTotalBookings: productDate.totalBookings,
                dateCreatedAt: productDate.createdAt,
                dateUpdatedAt: productDate.updatedAt,

                // Estado de la fecha
                dateStatusId: productDate.statusId,
                dateStatusName: status.name,
                dateStatusDescription: status.description,
            })
            .from(productDate)
            .leftJoin(status, eq(productDate.statusId, status.id))
            .where(eq(productDate.productId, productId))
            .orderBy(productDate.initialDate);

        if (datesResult.length === 0) {
            return [];
        }

        // Construir resultado final
        return datesResult.map((date) => ({
            // Información de la fecha
            date: {
                id: date.dateId,
                recordId: date.dateRecordId,
                initialDate: date.dateInitialDate,
                endDate: date.dateEndDate,
                timezone: date.dateTimezone,
                totalBookings: date.dateTotalBookings,
                createdAt: date.dateCreatedAt,
                updatedAt: date.dateUpdatedAt,
            },

            // Estado de la fecha
            status: {
                id: date.dateStatusId,
                name: date.dateStatusName,
                description: date.dateStatusDescription,
            },
        }));
    }

    public async findByProductRecordId(productRecordId: string): Promise<any[]> {
        const db = this.databaseService.getDatabase();

        // Buscar todas las fechas del producto por record ID
        const datesResult = await db
            .select({
                // Fecha
                dateId: productDate.id,
                dateRecordId: productDate.recordId,
                dateInitialDate: productDate.initialDate,
                dateEndDate: productDate.endDate,
                dateTimezone: productDate.timezone,
                dateTotalBookings: productDate.totalBookings,
                dateCreatedAt: productDate.createdAt,
                dateUpdatedAt: productDate.updatedAt,

                // Estado de la fecha
                dateStatusId: productDate.statusId,
                dateStatusName: status.name,
                dateStatusDescription: status.description,

                // Producto
                productId: product.id,
                productRecordId: product.recordId,
                productName: product.name,
                productAlias: product.alias,
            })
            .from(productDate)
            .leftJoin(status, eq(productDate.statusId, status.id))
            .leftJoin(product, eq(productDate.productId, product.id))
            .where(eq(product.recordId, productRecordId))
            .orderBy(productDate.initialDate);

        if (datesResult.length === 0) {
            return [];
        }

        // Construir resultado final
        return datesResult.map((date) => ({
            // Información de la fecha
            date: {
                id: date.dateId,
                recordId: date.dateRecordId,
                initialDate: date.dateInitialDate,
                endDate: date.dateEndDate,
                timezone: date.dateTimezone,
                totalBookings: date.dateTotalBookings,
                createdAt: date.dateCreatedAt,
                updatedAt: date.dateUpdatedAt,
            },

            // Estado de la fecha
            status: {
                id: date.dateStatusId,
                name: date.dateStatusName,
                description: date.dateStatusDescription,
            },

            // Información del producto
            product: {
                id: date.productId,
                recordId: date.productRecordId,
                name: date.productName,
                alias: date.productAlias,
            },
        }));
    }
}
