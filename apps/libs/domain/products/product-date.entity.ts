import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString, IsTimeZone, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Base } from '../common/base.entity';

export class ProductDateData extends Base {
    @ApiProperty({ description: 'Record ID of the product date' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    recordId: string;

    @ApiProperty({ description: 'Product ID this date belongs to' })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    productId: number;

    @ApiProperty({ description: 'Initial date and time' })
    @IsDateString()
    @IsNotEmpty()
    @Expose()
    initialDate: Date;

    @ApiPropertyOptional({ description: 'End date and time' })
    @IsDateString()
    @IsOptional()
    @Expose()
    endDate?: Date;

    @ApiPropertyOptional({ description: 'Timezone for the date' })
    @IsString()
    @IsOptional()
    @IsTimeZone()
    @Expose()
    timezone?: string;

    @ApiPropertyOptional({ description: 'Total bookings for this date' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    totalBookings?: number;

    @ApiPropertyOptional({ description: 'Status of the product date' })
    @IsOptional()
    @Expose()
    status?: Status;
}

export class ProductDate extends Base {
    @ApiProperty({ description: 'Record ID of the product date' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    recordId: string;

    @ApiProperty({ description: 'Product ID this date belongs to' })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    productId: number;

    @ApiProperty({ description: 'Initial date and time' })
    @IsDateString()
    @IsNotEmpty()
    @Expose()
    initialDate: Date;

    @ApiPropertyOptional({ description: 'End date and time' })
    @IsDateString()
    @IsOptional()
    @Expose()
    endDate?: Date;

    @ApiPropertyOptional({ description: 'Timezone for the date' })
    @IsString()
    @IsOptional()
    @IsTimeZone()
    @Expose()
    timezone?: string;

    @ApiPropertyOptional({ description: 'Total bookings for this date' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    totalBookings?: number;

    @ApiPropertyOptional({ description: 'Status of the product date' })
    @IsOptional()
    @Expose()
    status?: Status;

    constructor(data: ProductDateData) {
        super();

        this.id = data.id;
        this.recordId = data.recordId;
        this.productId = data.productId;
        this.initialDate = data.initialDate;
        this.endDate = data.endDate;
        this.timezone = data.timezone;
        this.totalBookings = data.totalBookings;
        this.status = data.status;
    }
}

export interface ProductDate {
    id: number;
    recordId: string;
    productId: number;
    initialDate: Date;
    endDate?: Date;
    timezone?: string;
    totalBookings?: number;
    status?: Status;
}
