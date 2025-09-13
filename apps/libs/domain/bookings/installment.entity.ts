import { IsDateString, IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { Base } from '../common/base.entity';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';

export class Installment extends Base {
    @IsNumber()
    amount: number;

    @IsString()
    bookingId: string;

    @IsUUID()
    customerId: string;

    @IsUUID()
    userId: string;

    @IsDateString()
    dueDate: string;

    @IsUUID()
    hostId: string;

    @IsNumber()
    order: number;

    @IsDateString()
    paymentDate?: string;

    @IsString()
    paymentId?: string;

    @IsEnum(PaymentStatus)
    paymentStatus: PaymentStatus;

    @IsUUID()
    planId: string;

    @IsUUID()
    productId: string;

    @IsString()
    dateId?: string;

    @IsNumber()
    notificationsSent?: number;

    @IsDateString()
    lastNotificationDate?: string;
}
