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
import { Base, BaseData } from '../common/base.entity';
import { Discount } from './discount.entity';
import { Breakdown } from '../billings/breakdown.entity';
import { ProductDate } from '../products/product.entity';
import { ProductPlan } from '../products/product.entity';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { SingleDate } from '../common/single-date.entity';

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
    user: BaseData;
    host: BaseData;
    invoice: BaseData;
    timezone: string;
    paymentMethod: {
        id: number;
        currency: Currency;
        key: PaymentMethod;
    };
    paymentMode: PaymentMode;
    date: {
        initialDate: SingleDate;
        endDate?: SingleDate;
    };
    plan: BaseData & {
        name: string;
    };

    constructor(init?: Partial<Booking>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }
}
