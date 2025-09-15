import { IsInt, Min, ValidateNested, IsOptional, IsEnum, IsDateString, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { BookingPaymentStatus } from 'apps/libs/common/enums/booking-payment-status.enum';
import { Attendee } from 'apps/libs/domain/common/attendee.entity';

class CancellationReason {
    @ApiProperty({
        description: 'Key representing the reason for cancellation.',
        example: 'DUPLICATED',
    })
    @IsString()
    key: string;

    @ApiProperty({
        description: 'Description of the reason for cancellation.',
        example: 'The reservation was duplicated.',
        required: false,
    })
    @IsOptional()
    @IsString()
    value?: string;
}

class Session {
    @ApiProperty({
        description: 'Booking date.',
        example: '2024-08-15',
    })
    @IsDateString()
    date: string;

    @ApiProperty({
        description: 'Booking time.',
        example: '08:00',
    })
    @IsString()
    time: string;
}

export class UpdateBookingDto {
    @ApiProperty({
        description: 'ID of the selected plan.',
        example: '2b160572',
        required: false,
    })
    @IsOptional()
    @IsString()
    planId?: string;

    @ApiProperty({
        description: 'ID of the selected date.',
        example: '1a160572',
        required: false,
    })
    @IsOptional()
    @IsString()
    dateId?: string;

    @ApiProperty({
        description: 'Booking status',
        example: BookingStatus.DELETED,
        default: BookingStatus.RECEIVED,
        required: false,
    })
    @IsOptional()
    @IsEnum(BookingStatus)
    bookingStatus?: BookingStatus;

    @ApiProperty({
        description: 'Booking status',
        example: BookingPaymentStatus.COMPLETED,
        required: false,
    })
    @IsOptional()
    @IsEnum(BookingPaymentStatus)
    paymentStatus?: BookingPaymentStatus;

    @ApiProperty({
        description: 'Total number of people in the booking.',
        type: Number,
        example: 1,
        required: true,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    totalAttendees?: number;

    @ApiProperty({
        description: 'Details of the attendees making the booking.',
        example: [{ email: 'test@email.com', firstName: 'John', lastName: 'Joe' }],
        required: false,
    })
    @IsOptional()
    attendees?: Attendee[];

    @ApiProperty({
        description: 'Reason for cancellation of the booking.',
        type: CancellationReason,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => CancellationReason)
    cancellationReason?: CancellationReason;

    @ApiProperty({
        description: 'Custom tags for the booking.',
        example: [
            {
                color: '#def7ec',
                value: 'activo',
            },
        ],
    })
    @IsArray()
    @IsOptional()
    tags?: {
        color: string;
        value: string;
    }[];
}
