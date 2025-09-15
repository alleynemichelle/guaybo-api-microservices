import { Injectable } from '@nestjs/common';
import { IBookingObserver, BookingEventContext } from '../interfaces/booking-observer.interface';

@Injectable()
export class BookingEventService {
    private observers: IBookingObserver[] = [];

    /**
     * Register a new observer for booking events
     * @param observer The observer to register
     */
    registerObserver(observer: IBookingObserver): void {
        this.observers.push(observer);
        this.observers.sort((a, b) => b.getPriority() - a.getPriority());
    }

    /**
     * Notify all observers of a booking event
     * @param context The context of the booking event
     */
    async notifyObservers(context: BookingEventContext): Promise<void> {
        for (const observer of this.observers) {
            try {
                await observer.handle(context);
            } catch (error) {
                // Log error but continue with other observers
                console.error(`Error in booking observer: ${error}`);
            }
        }
    }
}
