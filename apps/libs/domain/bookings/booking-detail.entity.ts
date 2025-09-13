import { IsArray } from 'class-validator';
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { Installment } from './installment.entity';

export class BookingDetail extends Booking {
    @IsArray()
    payments: Payment[];

    @IsArray()
    installments: Installment[];
}
