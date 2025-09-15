import { Expose, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Base, BaseData } from '../common/base.entity';
import { Price } from '../common/price.entity';

export class ProductPlanData extends BaseData {
    @ApiProperty({ description: 'Record ID of the product plan' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    recordId: string;

    @ApiProperty({ description: 'Product ID this plan belongs to' })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    productId: number;

    @ApiProperty({ description: 'Name of the plan' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    name: string;

    @ApiPropertyOptional({ description: 'Description of the plan' })
    @IsString()
    @IsOptional()
    @Expose()
    description?: string;

    @ApiPropertyOptional({ description: 'Order index for sorting' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    orderIndex?: number;

    @ApiPropertyOptional({ description: 'Total bookings for this plan' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    totalBookings?: number;

    @ApiPropertyOptional({ description: 'Minimum capacity for this plan' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    minCapacity?: number;

    @ApiPropertyOptional({ description: 'Maximum capacity for this plan' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    maxCapacity?: number;

    @ApiPropertyOptional({ description: 'Prices for this plan' })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Price)
    @Expose()
    prices?: Price[];
}

export class ProductPlan extends Base {
    @ApiProperty({ description: 'Record ID of the product plan' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    recordId: string;

    @ApiProperty({ description: 'Product ID this plan belongs to' })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    productId: number;

    @ApiProperty({ description: 'Name of the plan' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    name: string;

    @ApiPropertyOptional({ description: 'Description of the plan' })
    @IsString()
    @IsOptional()
    @Expose()
    description?: string;

    @ApiPropertyOptional({ description: 'Order index for sorting' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    orderIndex?: number;

    @ApiPropertyOptional({ description: 'Total bookings for this plan' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    totalBookings?: number;

    @ApiPropertyOptional({ description: 'Minimum capacity for this plan' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    minCapacity?: number;

    @ApiPropertyOptional({ description: 'Maximum capacity for this plan' })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Expose()
    maxCapacity?: number;

    @ApiPropertyOptional({ description: 'Prices for this plan' })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Price)
    @Expose()
    prices?: Price[];

    constructor(data: ProductPlanData) {
        super(data);
        this.recordId = data.recordId;
        this.productId = data.productId;
        this.name = data.name;
        this.description = data.description;
        this.orderIndex = data.orderIndex;
        this.totalBookings = data.totalBookings;
        this.minCapacity = data.minCapacity;
        this.maxCapacity = data.maxCapacity;
        this.prices = data.prices;
    }
}
