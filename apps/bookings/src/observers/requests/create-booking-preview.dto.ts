import { ApiProperty } from '@nestjs/swagger';

import {
    IsUUID,
    IsArray,
    ValidateNested,
    IsOptional,
    IsString,
    IsBoolean,
    IsInt,
    Min,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    ArrayMinSize,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FareType } from 'apps/libs/common/enums/fare-type.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';
import { SingleDate } from 'apps/libs/domain/common/single-date.entity';

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

export class CreateBookingPreviewDto {
    @ApiProperty({
        description: 'ID of the host.',
        example: '33c7b109-2d43-4c42-927f-8d7ff89d5704',
    })
    @IsUUID()
    hostId: string;

    @ApiProperty({
        description: 'ID of the selected product .',
        example: '12c7b109-2d43-4c42-927f-8d7ff89d5704',
    })
    @IsUUID()
    productId: string;

    @ApiProperty({
        description: 'ID of the selected plan.',
        example: 'e14dab94',
    })
    @IsString()
    planId: string;

    @ApiProperty({
        description: 'ID of the selected date.',
        example: 'e14dab94-0b8d',
        required: false,
    })
    @IsOptional()
    @IsString()
    dateId?: string;

    @ApiProperty({
        description: 'Currency to be used to calculate booking preview.',
        example: Currency.USD,
        required: false,
    })
    @IsOptional()
    @IsString()
    currency?: Currency;

    @ApiProperty({
        description: 'List of differentiated prices for the .',
        type: [BookingItem],
    })
    @IsArray()
    @ArrayMinSize(1)
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
        description: 'Should the payment be made in installments.',
        example: true,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    applyInstallments?: boolean;

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
