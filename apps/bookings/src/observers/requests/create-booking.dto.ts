import {
    IsUUID,
    IsInt,
    Min,
    IsArray,
    ValidateNested,
    IsOptional,
    IsNotEmpty,
    IsString,
    IsBoolean,
    IsTimeZone,
    IsEnum,
    IsNumber,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Attendee } from 'apps/libs/domain/common/attendee.entity';
import { FareType } from 'apps/libs/common/enums/fare-type.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';

import { SingleDate } from 'apps/libs/domain/common/single-date.entity';
import { CreatePaymentDto } from './create-payment.dto';

class BookingItem {
    @ApiProperty({
        description: 'Total number of bookings on this fare.',
        example: 1,
    })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({
        description: 'Pricing type.',
        example: 'GENERAL',
        enum: FareType,
        type: String,
    })
    @IsEnum(FareType, { each: true })
    @IsNotEmpty()
    fareType: FareType;

    @ApiProperty({
        description: 'Price per fare type (unit).',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiProperty({
        description: 'Total price to be paid per fare type.',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalAmount?: number;
}

export class CreateBookingDto {
    @ApiProperty({
        description: 'ID of the host.',
        example: '3ba10582-0835-4cee-9094-1a2b4663ffc4',
    })
    @IsUUID()
    hostId: string;

    @ApiProperty({
        description: 'ID of the selected product.',
        example: '12c7b109-2d43-4c42-927f-8d7ff89d5704',
    })
    @IsUUID()
    productId: string;

    @ApiProperty({
        description: 'ID of the selected plan.',
        example: '2b160572-0835-4cee-9094-1a2b4663ffc4',
    })
    @IsString()
    planId: string;

    @ApiProperty({
        description: 'ID of the selected date.',
        example: 'e14dab94-0b8d',
        required: false,
    })
    @IsString()
    @IsOptional()
    dateId?: string;

    @ApiProperty({
        description: 'Currency to be used to calculate booking preview.',
        example: Currency.USD,
        enum: Currency,
        required: false,
    })
    @IsEnum(Currency)
    @IsOptional()
    currency?: Currency;

    @ApiProperty({
        description: 'Timezone of the booking.',
        example: 'America/Caracas',
        type: String,
    })
    @IsTimeZone()
    timezone: string;

    @ApiProperty({
        description: 'List of differentiated prices for the service.',
        type: [BookingItem],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingItem)
    items: BookingItem[];

    @ApiProperty({
        description: 'The discount code applied to the reservation.',
        example: 'DISCOUNT2024',
        required: false,
    })
    @IsOptional()
    @IsString()
    coupon?: string;

    @ApiProperty({
        description: 'Payment will be done in installments.',
        example: true,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    applyInstallments?: boolean;

    @ApiProperty({
        description: 'Details of the required payment.',
        type: CreatePaymentDto,
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CreatePaymentDto)
    payment: CreatePaymentDto;

    @ApiProperty({
        description: 'Total number of people in the booking.',
        type: Number,
        example: 1,
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    totalAttendees: number;

    @ApiProperty({
        description: 'Details of the user making the booking.',
        type: Attendee,
        example: {
            firstName: 'Carlos',
            lastName: 'Garcia',
            email: 'carlosgarcia@gmail.com',
            phoneNumber: { code: '+58', number: '4141234567' },
        },
    })
    @ValidateNested()
    @Type(() => Attendee)
    user: Attendee;

    @ApiProperty({
        description: 'Details of the attendees making the booking.',
        type: [Attendee],
        example: [
            {
                email: 'test@email.com',
                firstName: 'John',
                lastName: 'Doe',
                phoneNumber: { code: '+58', number: '4141234567' },
            },
        ],
    })
    @ValidateNested()
    @Type(() => Attendee)
    attendees: Attendee[];

    @ApiProperty({
        description: 'The date of the booking.',
        example: {
            date: '2024-01-01',
            time: '10:00',
            timezone: 'America/Caracas',
        },
        required: false,
    })
    @Type(() => SingleDate)
    @IsOptional()
    @IsObject()
    session?: SingleDate;
}
