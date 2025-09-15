import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenSearchService } from 'apps/libs/repositories/opensearch/opensearch.service';
import { SEBulkResult } from 'apps/libs/repositories/opensearch/se-bulk-result.entity';
import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { IBookingsSearchDB } from '../interfaces/experiences-search-db.interface';

// OS = OpenSearch
@Injectable()
export class BookingsOSService implements IBookingsSearchDB {
    private readonly bookingsIndex: string;

    constructor(
        private readonly openSearchClient: OpenSearchService,
        private configService: ConfigService,
    ) {
        const stage = this.configService.get('STAGE') as string;
        const project = this.configService.get('PROJECT') as string;
        this.bookingsIndex = `${stage}-${project}-bookings-index`;
    }

    public async insert(bookings: Record<string, any>[]): Promise<SEBulkResult> {
        try {
            return await this.openSearchClient.indexDocument(bookings, this.bookingsIndex);
        } catch (error) {
            console.log('Error inserting bookings on search engine', error);
            throw error;
        }
    }

    public async getTotalBookingsByProductId(productId: string): Promise<number> {
        console.time(`getTotalBookingsByProductId-${productId}`);
        const query = {
            size: 0,
            track_total_hits: true,
            query: {
                bool: {
                    must: [
                        { term: { 'productId.keyword': productId } },
                        { term: { 'bookingStatus.keyword': BookingStatus.RECEIVED } },
                    ],
                },
            },
        };

        try {
            const result = await this.openSearchClient.search(this.bookingsIndex, query);
            console.timeEnd(`getTotalBookingsByProductId-${productId}`);
            return result.total;
        } catch (error) {
            console.timeEnd(`getTotalBookingsByProductId-${productId}`);
            console.log('Error getting total bookings by product id', error);
            throw error;
        }
    }

    public async getTotalBookingsByProductAndPlanId(productId: string, planId: string): Promise<number> {
        console.time(`getTotalBookingsByProductAndPlanId-${productId}-${planId}`);
        const query = {
            size: 0,
            track_total_hits: true,
            query: {
                bool: {
                    must: [
                        { term: { 'productId.keyword': productId } },
                        { match: { 'planId.keyword': planId } },
                        { term: { 'bookingStatus.keyword': BookingStatus.RECEIVED } },
                    ],
                },
            },
        };

        try {
            const result = await this.openSearchClient.search(this.bookingsIndex, query);
            console.timeEnd(`getTotalBookingsByProductAndPlanId-${productId}-${planId}`);
            return result.total;
        } catch (error) {
            console.timeEnd(`getTotalBookingsByProductAndPlanId-${productId}-${planId}`);
            console.log('Error getting total bookings by product and plan id', error);
            throw error;
        }
    }

    public async getTotalBookingsByProductAndDateId(productId: string, dateId: string): Promise<number> {
        console.time(`getTotalBookingsByProductAndDateId-${productId}-${dateId}`);
        const query = {
            size: 0,
            track_total_hits: true,
            query: {
                bool: {
                    must: [
                        { term: { 'productId.keyword': productId } },
                        { term: { 'dateId.keyword': dateId } },
                        { term: { 'bookingStatus.keyword': BookingStatus.RECEIVED } },
                    ],
                },
            },
        };

        try {
            const result = await this.openSearchClient.search(this.bookingsIndex, query);
            console.timeEnd(`getTotalBookingsByProductAndDateId-${productId}-${dateId}`);
            return result.total;
        } catch (error) {
            console.timeEnd(`getTotalBookingsByProductAndDateId-${productId}-${dateId}`);
            console.log('Error getting total bookings by product and date id', error);
            throw error;
        }
    }

    public async getTotalBookingsByProductAndDiscountId(productId: string, discountId: string): Promise<number> {
        console.time(`getTotalBookingsByProductAndDiscountId-${productId}-${discountId}`);
        const query = {
            size: 0,
            track_total_hits: true,
            query: {
                bool: {
                    must: [
                        { term: { 'productId.keyword': productId } },
                        { term: { 'bookingPreview.discounts.recordId.keyword': discountId } },
                        { term: { 'bookingStatus.keyword': BookingStatus.RECEIVED } },
                    ],
                },
            },
        };

        try {
            const result = await this.openSearchClient.search(this.bookingsIndex, query);
            console.timeEnd(`getTotalBookingsByProductAndDiscountId-${productId}-${discountId}`);
            return result.total;
        } catch (error) {
            console.timeEnd(`getBookingsByProductAndDiscountId-${productId}-${discountId}`);
            console.log('Error getting bookings by product and discount id', error);
            throw error;
        }
    }
}
