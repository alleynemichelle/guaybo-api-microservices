import { Injectable } from '@nestjs/common';

import { BookingPreview } from 'apps/libs/entities/bookings/booking-preview.entity';
import { Discount } from 'apps/libs/entities/bookings/discount.entity';
import { BaseProduct } from 'apps/libs/entities/products/product.entity';
import { Host } from 'apps/libs/entities/hosts/hosts.entity';
import { CreateBookingPreviewHandler } from '../handlers/create-booking-preview.handler';
import { CreateBookingPreviewDto } from '../../presentation/dto/create-booking-preview.dto';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto';
import { CreateBookingHandler } from '../handlers/create-booking.handler';
import { CreatePaymentHandler } from '../handlers/create-payment.handler';
/**
 * Main orchestrator service that coordinates all booking operations
 * Following the Application Service pattern for complex workflows
 */
@Injectable()
export class BookingOrchestratorService {
    constructor(
        private readonly createBookingPreviewHandler: CreateBookingPreviewHandler,
        private readonly createBookingHandler: CreateBookingHandler,
        private readonly createPaymentHandler: CreatePaymentHandler,
    ) {}

    /**
     * Orchestrates the creation of a booking preview
     */
    async createBookingPreview(
        data: CreateBookingPreviewDto,
        bookingProduct?: BaseProduct,
        bookingHost?: Host,
    ): Promise<{
        bookingPreview: BookingPreview;
        discountCode: Discount | null | undefined;
    }> {
        return this.createBookingPreviewHandler.handle(data, bookingProduct, bookingHost);
    }

    /**
     * Orchestrates the creation of a booking
     */
    async createBooking(bookingDto: CreateBookingDto): Promise<any> {
        return await this.createBookingHandler.handle(bookingDto);
    }

    /**
     * Orchestrates payment creation
     * TODO: This will be implemented with CreatePaymentHandler
     */
    async createPayment(bookingId: string, paymentDto: any): Promise<any> {
        return await this.createPaymentHandler.handle(bookingId, paymentDto);
    }

    /**
     * Orchestrates booking updates
     * TODO: This will be implemented with UpdateBookingHandler
     */
    async updateBooking(bookingId: string, updateDto: any): Promise<any> {
        throw new Error('UpdateBooking not yet implemented in new architecture');
    }

    /**
     * Orchestrates payment validation
     * TODO: This will be implemented with ValidatePaymentHandler
     */
    async validatePaymentReport(bookingId: string, validateDto: any): Promise<any> {
        throw new Error('ValidatePaymentReport not yet implemented in new architecture');
    }

    /**
     * Orchestrates getting booking details
     * TODO: This will be implemented with GetBookingHandler
     */
    async getBooking(bookingId: string): Promise<any> {
        throw new Error('GetBooking not yet implemented in new architecture');
    }

    /**
     * Orchestrates getting guest bookings
     * TODO: This will be implemented with GetGuestBookingsHandler
     */
    async getGuestBookings(params: { userId: string }): Promise<any> {
        throw new Error('GetGuestBookings not yet implemented in new architecture');
    }
}
