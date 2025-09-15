import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { PaymentMode } from 'apps/libs/common/enums/payment-mode.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { SessionAvailabilityType } from 'apps/libs/common/enums/session-availability-type.enum';

import { ConversionRate } from './conversion-rate.entity';
import { Attendee } from '../common/attendee.entity';
import { Base } from '../common/base.entity';
import { Discount } from './discount.entity';
import { Breakdown } from '../billings/breakdown.entity';
import { ProductDate } from '../products/product.entity';
import { ProductPlan } from '../products/product.entity';

export class BookingBilling {
    @IsString()
    invoiceId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Breakdown)
    breakdown: Breakdown[];

    @IsNumber()
    subtotal: number;

    @IsEnum(CommissionPayer)
    commissionPayer: CommissionPayer;

    @IsBoolean()
    commissionPaid: boolean;

    // Constructor to initialize properties from a partial object
    constructor(init?: Partial<BookingBilling>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}

export class Booking extends Base {
    @IsString()
    invoiceId: string;

    @IsArray()
    attendees: Array<Attendee>;

    @IsObject()
    bookingPreview: {
        appFee: {
            commissionPayer: CommissionPayer;
            amount: number;
        };
        conversionRates?: Array<ConversionRate>;
        discountedAmount: number;
        discounts: Array<Discount>;
        installmentsProgramApplied: boolean;
        items: Array<{
            discounts: Array<Discount>;
            fareType: string;
            finalPrice: number;
            price: number;
            quantity: number;
            totalAmount: number;
        }>;
        remainingAmount: number;
        subtotal: number;
        total: number;
    };

    @IsEnum(BookingStatus)
    bookingStatus: BookingStatus;

    @IsEnum(Currency)
    @IsOptional()
    currency?: Currency;

    @IsString()
    customerId: string;

    @IsString()
    userId: string;

    @IsEmail()
    email: string;

    @IsString()
    hostId: string;

    @IsString()
    productId: string;

    @IsString()
    dateId?: string;

    @IsString()
    paymentMethod?: string;

    @IsString()
    paymentStatus: string;

    @IsString()
    planId: string;

    @IsString()
    ticketNumber: string;

    @IsString()
    timezone: string;

    @IsNumber()
    totalAttendees: number;

    @IsObject()
    user: Attendee;

    @IsEnum(PaymentMode)
    paymentMode: PaymentMode;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => BookingBilling)
    billing?: BookingBilling;

    @ValidateNested()
    @Type(() => ProductDate)
    @IsOptional()
    date?: ProductDate;

    @ValidateNested()
    @Type(() => ProductPlan)
    @IsOptional()
    plan?: ProductPlan;

    @IsString()
    @IsOptional()
    sessionInitialDate?: string;

    @IsString()
    @IsOptional()
    sessionEndDate?: string;

    @IsEnum(SessionAvailabilityType)
    @IsOptional()
    availabilityType?: SessionAvailabilityType;

    @IsBoolean()
    @IsOptional()
    isTest?: boolean;

    @IsBoolean()
    @IsOptional()
    freeAccess?: boolean;

    // Constructor to initialize properties from a partial object
    constructor(init?: Partial<Booking>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }
}
